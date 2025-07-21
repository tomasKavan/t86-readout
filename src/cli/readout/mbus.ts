import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'
import Table = require('cli-table3');
import MBusMaster from "node-mbus"
import { config } from 'yargs';

export default {
  command: 'mbus',
  describe: 'Fetch values from MBus meters. Using TCP configuration and list of readout addresses.',
  builder: (yargs: any) => {
    return yargs
    .option('config', {
      type: 'object',
      description: 'MBus TCP configuration (host, port, timeout, etc.). For more details see node-mbus library documentation.',
      default: {
        host: 'localhost',
        port: 10001,
        timeout: 2000
      }
    })
    .option('i', {
      alias: 'inAddr', 
      type: 'string',
      description: 'Path to file with list of requested addresess/records. Each <addr>[:<recordId>] must be on separate line, followed by line break or break. Everything after break is considered as comment.',
      coerce: validateFilePath
    })
    .positional('addresses', {
      array: true,
      type: 'string',
      demandOption: true,
      description: 'List of Mbus primary addresses to read. Format: <addr>[:<recordId>]. If <recordId> is missing record 0 is used. One address can be multiple times in the list, but each time with different RecordId.'
    })
    .example('readoutcli readout mbus --config.host 10.30.40.50 --config.port 502 20 20:1 21 28', 
      'Read addresses 20 (record 0 and 1), 21 (record 0) and 28 (record 0) from TCP MBus host on 10.30.40.50:502')
  },
  handler: handleReadoutMbus
}

function validateFilePath(filePath: string): string {
  const ap = path.resolve(filePath)
  if (!fs.existsSync(ap)) {
    throw new Error(`Input file ${filePath} doesn't exists`)
  }
  return ap
}

type MeterRecord = {
  id: number,
  value: number,
  info: any
}

type Meter = {
  primary: number,
  records: MeterRecord[],
  info: any,
  error?: Error
}

async function handleReadoutMbus(args: any) {
  

  let addresses: Meter[] = []
  if (args.inAddr) {
    addresses = processAddressFile(args.inAddr)
  } else {
    addresses = processArgs(args._.slice(2))
  }
  
  const mm = new MBusMaster(args.config)
  mm.connect(async (err) => {
    if (err) {
      throw new Error(`MBusMaster CONNECT error: ${err}`)  
    }

    for (const addr of addresses) {
      const p = async () => {
        return new Promise((res, rej) => {
          mm.getData(addr.primary, (err, data) => {
            if (err) {
              rej(new Error(`MBusMaster READ error: ${err}`) )
            }
            res(data)
          })
        })
      }

      try {
        const data: any = await p()
        addr.info = data.SlaveInformation
        for (const rec of addr.records) {
          const d = (data.DataRecord as Array<any>).find(it => it.id === rec.id)
          if (!d) {
            throw new Error(`MBusMaster READ error: address ${addr.primary} doesn't have record id ${rec.id}`)
          }
          rec.value = d.Value
          rec.info = d
        }
      } catch (e: any) {
        addr.error = e.toString()
        console.error(e)
      }
    }

    let outFn = console.log
    if (args.o) {
      outFn = (t) => {
        fs.writeFileSync(args.o, t)
      }
    }

    switch(args.f) {
      case 'js': console.log(util.inspect(addresses, {
        showHidden: false,
        depth: null,
        colors: true
      })); break
      case 'json': outFn(JSON.stringify(addresses, null, "\t")); break
      case 'csv': outFn(formatToCsv(addresses)); break
      case 'table': outFn(formatToTable(addresses)); break
      default: throw new Error(`Output format ${args.f} is not yet implemented.`)
    }

    mm.close((err) => {
      if (err) {
        throw new Error(`MBusMaster CLOSE error: ${err}`)  
      }
    })

  })
}

function processAddressFile(path:string): Meter[] {
  const input = fs.readFileSync(path, 'utf-8')
  let lined = input.split('\n').map(item => item.split(' ')[0])
  lined = lined.map(item => {
    if (!item.includes(':')) {
      return item + ':0'
    }
    return item
  })
  return processArgs(lined, path)
}

function processArgs(list: Array<string>, fromFile?: string): Meter[] {
  if (!list.length) {
    if (!fromFile) {
      throw new Error('command "readout mbus" must be followed by at least 1 valid primary MBus address')
    }
    throw new Error(`input file ${path} of command "readout mbus" contain at least 1 valid primary MBus address`)
  }

  const addresses: Meter[] = []
  for (const addr of list) {
    let primary = null
    let record = null
    if (typeof addr === 'number') {
      primary = addr
      record = 0
    } else {
      const splitted = addr.split(':')
      if (splitted.length !== 2) {
        if (!fromFile) {
          throw new Error(`command "readout mbus" is followed by address ${addr}. Address must be in format <address>:<recordId>`)
        }
        throw new Error(`address ${addr} in the input file ${path} of command "readout mbus" is not in format <address>:<recordId>`)
      }
      primary = parseInt(splitted[0])
      record = parseInt(splitted[1]) 

      if (isNaN(primary) || isNaN(record) || primary < 0 || primary > 64 || record < 0) {
        if (!fromFile) {
          throw new Error(`command "readout mbus" is followed by address ${addr}. Address must be in format <address>:<recordId>. Where address is a number 0 - 64 and recordID is a positive number.`)
        }
        throw new Error(`address ${addr} in the input file ${path} of command "readout mbus" is not in format <address>:<recordId>. Where address is a number 0 - 64 and recordID is a positive number.`)
      }
    }

    let addq = addresses.find(it => it.primary === primary)
    if (!addq) {
      addq = {
        primary: primary,
        records: new Array<MeterRecord>(),
        info: null
      }
      addresses.push(addq)
    } 
    addq.records.push({
      id: record,
      value: 0,
      info: null
    })
  }
  return addresses
}

function formatToCsv(list: Meter[]): string {
  let out = 'primaryAddress;slaveSerial;manufacturer;recordId;value;timestamp;function;unit\n'
  for (const addr of list) {
    if (addr.error) {
      continue
    }
    for (const record of addr.records) {
      out += `${addr.primary};${addr.info.Id};${addr.info.Manufacturer};${record.id};${record.value};${record.info.Timestamp};${record.info.Function};"${record.info.Unit}"\n`
    }
  }
  return out
}

function formatToTable(list: Meter[]): string {
  const table = new Table({
    head: ['PRIM', 'Serial', 'Man', 'REC', 'Value', 'Timestamp', 'Function', 'Unit'],
  })
  for (const addr of list) {
    if (addr.error) {
      continue
    }
    for (const record of addr.records) {
      table.push([
        addr.primary, 
        addr.info.Id, 
        addr.info.Manufacturer, 
        record.id, 
        record.value, 
        record.info.Timestamp,
        record.info.Function,
        record.info.Unit ? record.info.Unit : ''
      ])
    }
  }
  return table.toString()
}