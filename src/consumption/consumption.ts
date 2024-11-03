import { Brackets, DataSource } from "typeorm"
import { ConsumptionDaily, ConsumptionHourly, ConsumptionMonthly, ConsumptionPlace, ConsumptionQhourly, MeterInstallation, MeterReadoutLog } from "../models";
import { ReadoutLogEntryStatus } from "../models/MeterReadoutLog";

const M15 = 15
const M15_S = M15 * 60
const M15_MS = M15_S * 1000 
const H_MS = M15_S * 4
const D_MS = H_MS * 24

function nextQhour(qhour: Date): Date {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return new Date(qts + M15_MS)
}

function prevQhour(qhour: Date): Date {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return new Date(qts - M15_MS)
}

function isEndOfHour(qhour: Date): boolean {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return qts % H_MS === 0
}

function isEndOfDay(qhour: Date): boolean {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return qts % D_MS === 0
}

function isEndOfMonth(qhour: Date): boolean {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  const nqhour = new Date(qts)
  return nqhour.getMinutes() === 0 && nqhour.getHours() === 0 && nqhour.getDate() === 1
}

function prevHour(qhour: Date): Date {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return new Date(qts - H_MS)
}

function prevDay(qhour: Date): Date {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  return new Date(qts - D_MS)  
}

function prevMonth(qhour: Date): Date {
  const ts = qhour.getTime()
  const qts = Math.floor(ts/ M15_MS) * M15_MS
  const nqhour = new Date(qts)
  nqhour.setMonth(nqhour.getMonth() - 1)
  return nqhour
}

type QhourWorking = {
  qhour: Date,
  prevQhour: Date,
  cp: ConsumptionPlace,
  mi: MeterInstallation,
  firstRec?: MeterReadoutLog | null,
  lastRec?: MeterReadoutLog | null,
  consumption: number
}

type CpQhourSum = {
  cp: ConsumptionPlace,
  qhour: Date,
  consumption: number
}

export async function consumption(ds: DataSource) {
  const qhEnd = new Date()
  qhEnd.setMinutes(Math.floor(qhEnd.getMinutes()/15)*15, 0, 0)
  const qhBeg = new Date(qhEnd.getTime() - M15_MS)

  console.log(`[consumption.ts] Solving for <${qhBeg} : ${qhEnd}>`)

  // Select all installation werent computed up to this qhour (lockReadoutBefore)
  // And which are still installed (removal IS NULL)
  // Or were remove, but weren't computed up to removal timestamp
  const insts = await ds.manager
    .createQueryBuilder(ConsumptionPlace, 'cp')
    .innerJoinAndSelect('cp.installedMeters', 'mi')
    .where(new Brackets(qb => {
      qb.where('mi.lockedReadoutBefore <= :qhEnd', {qhEnd})
      .orWhere('mi.lockedReadoutBefore IS NULL')
    }))
    .andWhere(
      new Brackets(qb => {
        qb.where('mi.removal IS NULL')
        .orWhere('mi.removal > mi.lockedReadoutBefore')
      })
    )
    .getMany()

  // For each Installation find all unporcessed qhours
  // It's all qhours between lockReadoutBefore and MIN(qhEnd; mi.removal)
  // If lockReadoutBefore is null, takemi.installation instead
  const qhours: QhourWorking[] = []
  insts.forEach(cp => {
    cp.installedMeters.forEach(mi => {
      let time = mi.lockedReadoutBefore ? mi.lockedReadoutBefore : mi.installation
      while (time.getTime() < qhEnd.getTime()) {
        time = nextQhour(time)
        qhours.push({
          qhour: time,
          prevQhour: prevQhour(time),
          cp: cp,
          mi: mi,
          consumption: 0
        })
      }
    })
  })

  // Process over each qhour
  // Select 1 readout (rBeg) which has most recent time, 
  //   but is older than qhBeg
  // If there is none, select 1 readout which is the oldest, 
  //   but more recent than qhBeg
  // If there is still none, lock Readout and continue to the next qhour
  // Select 1 readout (rEnd) which is more recent, but older then ghEnd 
  //   and more recent than qhBeg 
  // If there is non or is the same as rBeg, lock Readout and continue to the next qhour
  // Compute consumption, store it to Consumption Place (add), lock Readout and continue to the next qhour
  
  // TODO: The MeterInstallation table should be probably locked for writing, until 
  // consumption is updated
  for (let i = 0; i < qhours.length; i++) {
    const qw = qhours[i]
    console.log(`[consumption.ts] Processing place <${qw.cp.mbusPrimary}>${qw.cp.name}. QHour ${qw.qhour}. Meter ${qw.mi.meter}`)
    qw.firstRec = await ds.manager
      .createQueryBuilder(MeterReadoutLog, 'mrl')
      .where('mrl.installation = :inst', {inst: qw.mi.id})
      .andWhere('mrl.status = :status', {status: ReadoutLogEntryStatus.OK })
      .andWhere('mrl.time <= :beg', {beg: qw.prevQhour})
      .orderBy('mrl.time', 'DESC')
      .getOne()
    if (!qw.firstRec) {
      qw.firstRec = await ds.manager
        .createQueryBuilder(MeterReadoutLog, 'mrl')
        .where('mrl.installation = :inst', {inst: qw.mi.id})
        .andWhere('mrl.status = :status', {status: ReadoutLogEntryStatus.OK })
        .andWhere('mrl.time >= :beg', {beg: qw.prevQhour})
        .orderBy('mrl.time', 'ASC')
        .getOne()
    }
    if (!qw.firstRec) {
      continue
    }
    qw.lastRec = await ds.manager
      .createQueryBuilder(MeterReadoutLog, 'mrl')
      .where('mrl.installation = :inst', {inst: qw.mi.id})
      .andWhere('mrl.status = :status', {status: ReadoutLogEntryStatus.OK })
      .andWhere('mrl.time <= :end', {end: qw.qhour})
      .andWhere('mrl.time > :beg', {beg: qw.prevQhour})
      .orderBy('mrl.time', 'DESC')
      .getOne()
    if (!qw.lastRec) {
      continue
    }
    qw.consumption += (qw.lastRec.value - qw.firstRec.value)
  }

  const byCpAndQhour: CpQhourSum[] = []
  const misToSave: MeterInstallation[] = []
  for (let i = 0; i < qhours.length; i++) {
    const qh = qhours[i]
    let mis = misToSave.find(mis => mis.id === qh.mi.id)
    if (!mis) {
      mis = qh.mi
      misToSave.push(mis)
    }
    if (mis.lockedReadoutBefore < qh.qhour) {
      mis.lockedReadoutBefore = qh.qhour
    }
    let cqs = byCpAndQhour.find(cqs => {
      return cqs.cp.mbusPrimary === qh.cp.mbusPrimary 
        && cqs.qhour.getTime() === qh.qhour.getTime()
    })
    if (!cqs) {
      cqs = {
        cp: qh.cp,
        qhour: qh.qhour,
        consumption: 0
      }
      byCpAndQhour.push(cqs)
    }
    if (qh.firstRec && qh.lastRec) {
      cqs.consumption += qh.lastRec.value - qh.firstRec.value
    }
  }

  await ds.manager.transaction(async tem => {
    console.log(`[consumption.ts] Begin transaction`)
    for (let i = 0; i < misToSave.length; i++) {
      await tem.save(misToSave[i])
    }
    for (let i = 0; i < byCpAndQhour.length; i++) {
      const bcq = byCpAndQhour[i]
      if (bcq.consumption) {
        console.log(`[consumption.ts] Place: <${bcq.cp.mbusPrimary}>${bcq.cp.name}. Found consumption ${bcq.consumption} Qhour ${bcq.qhour}`)
        const cqh = new ConsumptionQhourly()
        cqh.consumptionPlace = bcq.cp
        cqh.time = bcq.qhour
        cqh.value = bcq.consumption
        await tem.save(cqh)
      }
      
      // Aggregate over hour (if appropriate)
      if (isEndOfHour(bcq.qhour)) {
        const begOfHour = prevHour(bcq.qhour)
        console.log(`[consumption.ts] Aggregating place <${bcq.cp.mbusPrimary}>${bcq.cp.name}. Hour ${bcq.qhour}`)
        const list = await tem
          .createQueryBuilder(ConsumptionQhourly, 'cqh')
          .where('cqh.consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .andWhere('cqh.time > :begin', {begin: begOfHour})
          .andWhere('cqh.time <= :end', {end: bcq.qhour})
          .getMany()
        const hourly = new ConsumptionHourly()
        hourly.consumptionPlace = bcq.cp
        hourly.time = bcq.qhour
        hourly.value = list.reduce((acc, curr) => {
          return curr.value + acc
        }, 0)
        await tem.createQueryBuilder(ConsumptionHourly, 'ch')
          .delete()
          .where('time = :time', {time: hourly.time})
          .andWhere('consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .execute()
        if (hourly.value > 0) {
          await tem.save(hourly)
        }
      }

      // Aggregate over day (if appropriate)
      if (isEndOfDay(bcq.qhour)) {
        const begOfDay = prevDay(bcq.qhour)
        console.log(`[consumption.ts] Aggregating place <${bcq.cp.mbusPrimary}>${bcq.cp.name}. Day ${bcq.qhour}`)
        const list = await tem
          .createQueryBuilder(ConsumptionQhourly, 'cqh')
          .where('cqh.consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .andWhere('cqh.time > :begin', {begin: begOfDay})
          .andWhere('cqh.time <= :end', {end: bcq.qhour})
          .getMany()
        const daily = new ConsumptionDaily()
        daily.consumptionPlace = bcq.cp
        daily.time = bcq.qhour
        daily.value = list.reduce((acc, curr) => {
          return curr.value + acc
        }, 0)
        await tem.createQueryBuilder(ConsumptionDaily, 'cd')
          .delete()
          .where('time = :time', {time: daily.time})
          .andWhere('consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .execute()
        if (daily.value > 0) {
          await tem.save(daily)
        }
      }

      // Aggregate over month (if appropriate)
      if (isEndOfMonth(bcq.qhour)) {
        const begOfMonth = prevMonth(bcq.qhour)
        console.log(`[consumption.ts] Aggregating place <${bcq.cp.mbusPrimary}>${bcq.cp.name}. Month ${bcq.qhour}`)
        const list = await tem
          .createQueryBuilder(ConsumptionQhourly, 'cqh')
          .where('cqh.consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .andWhere('cqh.time > :begin', {begin: begOfMonth})
          .andWhere('cqh.time <= :end', {end: bcq.qhour})
          .getMany()
        const monthly = new ConsumptionMonthly()
        monthly.consumptionPlace = bcq.cp
        monthly.time = bcq.qhour
        monthly.value = list.reduce((acc, curr) => {
          return curr.value + acc
        }, 0)
        await tem.createQueryBuilder(ConsumptionMonthly, 'cm')
          .delete()
          .where('time = :time', {time: monthly.time})
          .andWhere('consumptionPlace = :cp', {cp: bcq.cp.mbusPrimary})
          .execute()
        if (monthly.value > 0) {
          await tem.save(monthly)
        }
      }
    }
    console.log(`[consumption.ts] Commit transaction`)
  })
}