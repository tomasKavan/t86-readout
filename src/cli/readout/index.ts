import MBusCmd from './mbus'

export default {
  command: 'readout',
  describe: 'Fetch values from meters',
  builder: (yargs) => {
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
      description: 'Path to file to print output to.'
    })
    .command(MBusCmd)
  },
  handler: () => {
    throw new Error('Command readout does nothing. Try to use command mbus instead.')
  }
}