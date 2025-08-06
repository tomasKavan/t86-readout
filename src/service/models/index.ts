import { Correction } from './Correction'
import { MeasPoint } from './MeasPoint'
import { Metric } from './Metric'
import { Readout } from './Readout'
import { ServiceEvent } from './ServiceEvent'
import { SerieEntry } from './SerieEntry'
import { MBusSlave } from './MBusSlave'
import { MBusRecord } from './MBusRecord'

const modelsArray = [
  MeasPoint,
  Metric,
  Readout,
  ServiceEvent,
  Correction
]

export {
  modelsArray,
  
  MeasPoint,
  Metric,
  Readout,
  ServiceEvent,
  Correction,

  SerieEntry,
  MBusSlave,
  MBusRecord
}
