export enum Subject {
  ELECTRICITY = 'ele',
  GAS_FUEL = 'gas',
  WATER = 'wat',
  HEAT = 'hth',
  ENVIRONMENT = 'env',
  CLEANING = 'cln'
}

export enum SubjectSpec {
  COLD = 'cold',
  HOT = 'hot'
}

export enum MetricType {
  CONSUMPTION = 'cons',
  TIME_ELAPSED = 'tel'
}

export enum Func {
  INST = 'inst',
  SUM = 'sum'
}

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

export const unitMatrix: UnitMatrix = {
  [Subject.ELECTRICITY]: {
    [MetricType.CONSUMPTION]: Unit.WATT_HOUR
  },
  [Subject.GAS_FUEL]: {
    [MetricType.CONSUMPTION]: Unit.LITER
  },
  [Subject.WATER]: {
    [MetricType.CONSUMPTION]: Unit.LITER
  },
  [Subject.HEAT]: {
    [MetricType.CONSUMPTION]: Unit.WATT_HOUR
  },
  [Subject.CLEANING]: {
    [MetricType.TIME_ELAPSED]: Unit.SECOND
  }
}

export function unitForMetric(subject: Subject, type: MetricType): Unit | undefined {
  return unitMatrix[subject]?.[type]
}
