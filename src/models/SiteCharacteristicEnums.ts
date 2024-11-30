export enum CharacteristicType {
  ELECTRICITY = 'elec',
  NATURAL_GAS = 'ngas',
  COLD_WATER = 'cwat',
  HOT_WATER = 'hwat',
  HEAT = 'heat',
  TEMPERATURE = 'temp',
  REL_HUMIDITY = 'rhum',
  BRIGHTNESS = 'brtn',
  PRESSURE = 'pres',
  VOC = 'voc',
  CO2 = 'co2'
}

export enum Unit {
  CUBIC_METER = 'm3',
  WATT_HOUR = 'Wh',
  SECOND = 's',
  CELSIUS = 'degC',
  PERCENT = '%',
  LUX = 'lx',
  PASCAL = 'Pa',
  AIR_QUALITY = 'AQ'
}

export function characteristicTypeUnit(charType: CharacteristicType): string | null {
  switch (charType) {
    case CharacteristicType.ELECTRICITY:
    case CharacteristicType.NATURAL_GAS:
    case CharacteristicType.HEAT:
      return Unit.WATT_HOUR
    case CharacteristicType.HOT_WATER:
    case CharacteristicType.COLD_WATER:
      return Unit.CUBIC_METER
    case CharacteristicType.TEMPERATURE:
      return Unit.CELSIUS
    case CharacteristicType.REL_HUMIDITY:
    case CharacteristicType.CO2:
      return Unit.PERCENT
    case CharacteristicType.BRIGHTNESS:
      return Unit.LUX
    case CharacteristicType.PRESSURE:
      return Unit.PASCAL
    case CharacteristicType.VOC:
      return Unit.AIR_QUALITY
  }
  throw new Error(`Unknown Charasteristic: ${charType}`)
}

export enum Function {
  INSTANT = 'instant',
  MAX = 'max',
  MIN = 'min',
  AVERAGE = 'avg'
}
