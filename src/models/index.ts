
import { DataSeries } from './DataSeries'
import { DataSeriesQhourly } from './DataSeriesQhourly'
import { DataSeriesHourly } from './DataSeriesHourly'
import { DataSeriesDaily } from './DataSeriesDaily'
import { DataSeriesMonthly } from './DataSeriesMonthly'
import { GeoLocation } from './GeoLocation'
import { Meter } from './Meter'
import { MeterType } from './MeterType'
import { MeterTypeUnit } from './MeterTypeUnit'
import { MeterTypeUnitMbus } from './MeterTypeUnitMbus'
import { Method } from './Method'
import { MethodMBus } from './MethodMbus'
import { Site } from './Site'
import { SiteMeterInstallation } from './SiteMeterInstallation'
import { SiteMeterInstallationMBus } from './SiteMeterInstallationMbus'
import { SiteMeterInstallationMap } from './SiteMeterInstallationMap'

import { SiteMeterInstallationTriggers } from './SiteMeterInstallation'

const modelsArray = [
  DataSeries, 
  DataSeriesQhourly,
  DataSeriesHourly,
  DataSeriesDaily,
  DataSeriesMonthly,
  GeoLocation,
  Meter,
  MeterType,
  MeterTypeUnit,
  MeterTypeUnitMbus,
  Method,
  MethodMBus,
  Site,
  SiteMeterInstallation,
  SiteMeterInstallationMBus,
  SiteMeterInstallationMap
]

const subscribersArray = [
  SiteMeterInstallationTriggers
]

export {
  subscribersArray,
  modelsArray,
  DataSeries, 
  DataSeriesQhourly,
  DataSeriesHourly,
  DataSeriesDaily,
  DataSeriesMonthly,
  GeoLocation,
  Meter,
  MeterType,
  MeterTypeUnit,
  MeterTypeUnitMbus,
  Method,
  MethodMBus,
  Site,
  SiteMeterInstallation,
  SiteMeterInstallationMBus,
  SiteMeterInstallationMap
}
