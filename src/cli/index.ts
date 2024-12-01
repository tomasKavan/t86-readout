#!/usr/bin/env node


import yargs from 'yargs'
import ReadoutCmd from './readout/index'


yargs(process.argv.slice(2))
.command(ReadoutCmd)
// .command('readout', 'Fetch values from meters',
//   (yargs) => {
//     yargs
//     .option('f', {
//       alias: 'format',
//       demandOption: true,
//       default: 'json',
//       choises: ['js', 'json', 'csv', 'table'],
//       description: 'Output format.'
//     })
//     .option('o', {
//       alias: 'outFile', 
//       type: 'string',
//       description: 'Path to file to print output to.'
//     })
//     .command('mbus', 'Fetch values from MBus meters. Using TCP configuration and list of readout addresses.',
//       (yargs) => {
//         yargs
//         .options('config', {
//           alias: 'c',
//           type: 'object',
//           description: 'MBus TCP configuration (host, port, timeout, etc.). For more details see node-mbus library documentation.',
//           default: {
//             host: 'localhost',
//             port: 10001,
//             timout: 2000,
//             autoConnect: true
//           }
//         })
//         .option('i', {
//           alias: 'inAddr', 
//           type: 'string',
//           description: 'Path to file with list of requested addresess/records. Each <addr>[:<recordId>] must be on separate line, followed by line break or break. Everything after break is considered as comment.'
//         })
//         .positional('addresses', {
//           array: true,
//           type: 'string',
//           demandOption: true,
//           description: 'List of Mbus primary addresses to read. Format: <addr>[:<recordId>]. If <recordId> is missing record 0 is used. One address can be multiple times in the list, but each time with different RecordId.'
//         })
//         .example('readoutcli readout mbus --config.host 10.30.40.50 --config.port 502 20 20:1 21 28', 
//           'Read addresses 20 (record 0 and 1), 21 (record 0) and 28 (record 0) from TCP MBus host on 10.30.40.50:502')
//       },
//       handleReadoutMbus
//     )
//   }
// )
.help()
.parse()

