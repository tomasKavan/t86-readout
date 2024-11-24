
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
import { ReadMethod } from './ReadMethod'
import { ReadMethodMBus } from './ReadMethodMbus'
import { ReadMethodApi } from './ReadMethodApi'
import { Site } from './Site'
import { SiteMeterInstallation } from './SiteMeterInstallation'
import { SiteMeterInstallationMBus } from './SiteMeterInstallationMbus'
import { SiteMeterInstallationApi } from './SiteMeterInstallationApi'
import { SiteMeterInstallationMap } from './InstallationMap'

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
  ReadMethod,
  ReadMethodMBus,
  ReadMethodApi,
  Site,
  SiteMeterInstallation,
  SiteMeterInstallationMBus,
  SiteMeterInstallationApi,
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
  ReadMethod,
  ReadMethodMBus,
  ReadMethodApi,
  Site,
  SiteMeterInstallation,
  SiteMeterInstallationMBus,
  SiteMeterInstallationApi,
  SiteMeterInstallationMap
}
