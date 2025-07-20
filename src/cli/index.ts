#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ReadoutCmd from './readout/index'

//yargs(process.argv.slice(2))
yargs(hideBin(process.argv))
.command(ReadoutCmd)
.help()
.parse()

