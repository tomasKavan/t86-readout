#!/usr/bin/env node

import util from 'util'
import yargs from 'yargs'
import Table = require('cli-table3');
import * as MbusMasterDef from "node-mbus"
const MbusMaster = MbusMasterDef.default

yargs(process.argv.slice(2))
.command('readout', 'Fetch values from meters',
  (yargs) => {
    yargs
    .option('f', {
      alias: 'format',
      demandOption: true,
      default: 'json',
      choises: ['js', 'json', 'csv', 'table'],
      description: 'Output format.'
    })
    .option('o', {
      alias: 'outFile', 
      type: 'string',
      description: 'Path to file to print output to.'
    })
    .command('mbus', 'Fetch values from MBus meters. Using TCP configuration and list of readout addresses.',
      (yargs) => {
        yargs
        .options('config', {
          alias: 'c',
          type: 'object',
          description: 'MBus TCP configuration (host, port, timeout, etc.). For more details see node-mbus library documentation.',
          default: {
            host: 'localhost',
            port: 10001,
            timout: 2000,
            autoConnect: true
          }
        })
        .option('i', {
          alias: 'inAddr', 
          type: 'string',
          description: 'Path to file with list of requested addresess/records. Each <addr>[:<recordId>] must be on separate line, followed by line break or break. Everything after break is considered as comment.'
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
      handleReadoutMbus
    )
  }
)
.help()
.parse()

type MeterRecord = {
  id: number,
  value: number,
  info: any
}

type Meter = {
  primary: number,
  records: MeterRecord[],
  info: any
}

async function handleReadoutMbus(args) {
  let addrList = args._.slice(2)
  if (!addrList.length) {
    throw new Error('command "readout mbus" must be followed by at least 1 valid primary MBus address')
  }

  const addresses: Meter[] = []
  for (const addr of addrList) {
    let primary = null
    let record = null
    if (typeof addr === 'number') {
      primary = addr
      record = 0
    } else {
      const splitted = addr.split(':')
      if (splitted.length !== 2) {
        throw new Error(`command "readout mbus" is followed by address ${addr}. Address must be in format <address>:<recordId>`)
      }
      primary = parseInt(splitted[0])
      record = parseInt(splitted[1]) 

      if (isNaN(primary) || isNaN(record) || primary < 0 || primary > 64 || record < 0) {
        throw new Error(`command "readout mbus" is followed by address ${addr}. Address must be in format <address>:<recordId>. Where address is a number 0 - 64 and recordID is a positive number.`)
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
      value: null,
      info: null
    })
  }

  const mm = new MbusMaster(args.config)
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
      } catch (e) {
        console.error(e)
      }
    }

    switch(args.f) {
      case 'js': console.log(util.inspect(addresses, {
        showHidden: false,
        depth: null,
        colors: true
      })); break
      case 'json': console.log(JSON.stringify(addresses, null, "\t")); break
      case 'csv': console.log(formatToCsv(addresses)); break
      case 'table': console.log(formatToTable(addresses)); break
      default: throw new Error(`Output format ${args.f} is not yet implemented.`)
    }

    mm.close((err) => {
      if (err) {
        throw new Error(`MBusMaster CLOSE error: ${err}`)  
      }
    })

  })
}

function formatToCsv(list: Meter[]): string {
  let out = 'primaryAddress;slaveSerial;manufacturer;recordId;value;timestamp;function;unit\n '
  for (const addr of list) {
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