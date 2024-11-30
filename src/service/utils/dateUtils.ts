export function getTimezoneOffset(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  }).formatToParts(date)
  const offsetStr = parts.find(part => part.type === 'timeZoneName').value

  const match = offsetStr.match(/GMT([+-]\d{1,2}):?(\d{2})?/)
  if (!match) {
    return 0
  }
  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2] || '0', 10)
  return hours * 60 + (hours < 0 ? -minutes : minutes)
}

export function getLocalTimeZoneName() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

type AmiguousSet = {
  date: Date,
  offset: string,
  afterHour: Date,
  afterOffset: string,
  beforeHour: Date,
  beforeOffset: string
}
function _abiguousBase(date: Date, timeZone: string): AmiguousSet {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  })

  const out = {
    date,
    offset: format.formatToParts(date).find(part => part.type === 'timeZoneName').value,
    afterHour: new Date(date.getTime() + 60 * 60 * 1000),
    afterOffset: '',
    beforeHour: new Date(date.getTime() - 60 * 60 * 1000),
    beforeOffset: ''
  }

  out.afterOffset = format.formatToParts(out.afterHour).find(part => part.type === 'timeZoneName').value,
  out.beforeOffset = format.formatToParts(out.beforeHour).find(part => part.type === 'timeZoneName').value

  return out
}

export function isAmbiguous(date: Date, timeZone): boolean {
  const amb = _abiguousBase(date, timeZone)

  // Ambiguity exists if the offsets differ but the hour is the same
  return (amb.offset !== amb.afterOffset && date.getHours() === amb.afterHour.getHours()) ||
  (amb.offset !== amb.beforeOffset && date.getHours() === amb.beforeHour.getHours())
}

export function normalizeAmbiguosDate(date: Date, timeZone: string): Date {
  const amb = _abiguousBase(date, timeZone)

  // Ambiguity exists if the offsets differ but the hour is the same
  if (amb.offset !== amb.afterOffset && date.getHours() === amb.afterHour.getHours()) {
    return date > amb.afterHour ? amb.afterHour : date
  } 
  
  if (amb.offset !== amb.beforeOffset && date.getHours() === amb.beforeHour.getHours()) {
    return date > amb.beforeHour ? amb.beforeHour : date
  }

  return date
}


