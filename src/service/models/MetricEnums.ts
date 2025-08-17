import { registerEnumType } from 'type-graphql'

export enum Subject {
  ELECTRICITY = 'ele',
  GAS_FUEL = 'gas',
  WATER = 'wat',
  HEAT = 'hth',
  ENVIRONMENT = 'env',
  CLEANING = 'cln'
}

registerEnumType(Subject, {
  name: 'MeasPointSubject',
  description: 'Subject of measurements observed by meter on measurement point'
})

export enum SubjectSpec {
  COLD = 'cold',
  HOT = 'hot'
}

registerEnumType(SubjectSpec, {
  name: 'MeasPointSubjectSpecifier',
  description: 'Close specificationon of MeasPoint Subject. Can be null'
})

export enum MetricType {
  CONSUMPTION = 'cons',
  TIME_ELAPSED = 'tel'
}

registerEnumType(MetricType, {
  name: 'MetricType',
  description: 'Recurent event observed/measured by metric. Like consumption or time elapsed.'
})


export enum Func {
  INST = 'inst',
  SUM = 'sum'
}

registerEnumType(Func, {
  name: 'MetricFunc',
  description: 'Type of function related to metric. Describes if observed values are instantenious, summary or something else.'
})

export enum Unit {
  LITER = 'l',
  WATT_HOUR = 'wh',
  SECOND = 's'
}

type UnitMatrix = {
  [S in Subject]?: {
    [M in MetricType]?: Unit
  }
}

// const unitMatrix: UnitMatrix = {
//   [Subject.ELECTRICITY]: {
//     [MetricType.CONSUMPTION]: Unit.WATT_HOUR
//   },
//   [Subject.GAS_FUEL]: {
//     [MetricType.CONSUMPTION]: Unit.LITER
//   },
//   [Subject.WATER]: {
//     [MetricType.CONSUMPTION]: Unit.LITER
//   },
//   [Subject.HEAT]: {
//     [MetricType.CONSUMPTION]: Unit.WATT_HOUR
//   },
//   [Subject.CLEANING]: {
//     [MetricType.TIME_ELAPSED]: Unit.SECOND
//   }
// }

// function unitForMetric(subject: Subject, type: MetricType): Unit | undefined {
//   return unitMatrix[subject]?.[type]
// }
