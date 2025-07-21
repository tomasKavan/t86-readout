import * as path from 'path'
import * as fs from 'fs'
import MBusCmd from './mbus'
import { coerce } from 'yargs'

export default {
  command: 'readout',
  describe: 'Fetch values from meters',
  builder: (yargs: any) => {
    return yargs
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
      description: 'Path to file to print output to.',
      coerce: validateFilePath
    })
    .command(MBusCmd)
  },
  handler: () => {
    throw new Error('Command readout does nothing. Try to use command mbus instead.')
  }
}

function validateFilePath(filePath: string): string {
  const ap = path.resolve(filePath)
  if (fs.existsSync(ap)) {
    throw new Error(`Output file ${filePath} already exists`)
  }
  return ap
}
