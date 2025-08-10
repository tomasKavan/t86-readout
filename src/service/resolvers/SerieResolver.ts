import { Arg, Ctx, Query, Resolver } from 'type-graphql'
import { addDays, addMinutes, addMonths, isBefore, isEqual, startOfDay, startOfMonth } from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime} from 'date-fns-tz'

import { Sampling, Serie } from '../models/Serie'
import { QuerySerie } from '../types/SerieTypes'
import { ApiContext } from '../graphqlServer'
import { Metric, SerieEntry } from '../models'
import { In } from 'typeorm'

const TIMEZONE = 'Europe/Prague'

type Boundary = {
  endTs: Date, 
  prevTs: Date
}

const sql = `WITH
boundaries AS (
  SELECT jt.end_ts AS endTs, jt.prev_ts AS prevTs
  FROM JSON_TABLE(
    ?, '$[*]'
    COLUMNS (
      end_ts  DATETIME PATH '$.endTs',
      prev_ts DATETIME PATH '$.prevTs'
    )
  ) jt
),
metrics AS (
  SELECT jt.metricId AS metricId
  FROM JSON_TABLE(
    ?, '$[*]'
    COLUMNS (metricId INT PATH '$')
  ) jt
),
calc AS (
  SELECT
    b.endTs        AS bucketEndUTC,
    m.metricId     AS metricId,
    /* last cumulative value <= prev boundary */
    (
      SELECT r.value
      FROM readout r
      WHERE r.metricId = m.metricId
        AND r.meterUTCTimestamp <= b.prevTs
        AND r.deletedUTCTime IS NULL
      ORDER BY r.meterUTCTimestamp DESC
      LIMIT 1
    ) AS prev_value,
    /* last cumulative value <= current boundary */
    (
      SELECT r.value
      FROM readout r
      WHERE r.metricId = m.metricId
        AND r.meterUTCTimestamp <= b.endTs
        AND r.deletedUTCTime IS NULL
      ORDER BY r.meterUTCTimestamp DESC
      LIMIT 1
    ) AS curr_value,
    (
      SELECT COALESCE(SUM(c.value), 0)
      FROM correction c
      JOIN service_event se
        ON se.id = c.serviceEventId
      WHERE c.metricId = m.metricId
        AND c.deletedUTCTime IS NULL
        AND se.occuredUTCTime >  b.prevTs
        AND se.occuredUTCTime <= b.endTs
    ) AS corr_sum
  FROM boundaries b
  CROSS JOIN metrics m
)
SELECT
  bucketEndUTC,
  metricId,
  (curr_value - prev_value) + corr_sum AS consumption
FROM calc
WHERE prev_value IS NOT NULL AND curr_value IS NOT NULL
ORDER BY bucketEndUTC, metricId;`

@Resolver(() => Serie)
export class SerieResolver {
  @Query(() => Serie)
  async serie(
    @Arg('params') params: QuerySerie,
    @Ctx() ctx: ApiContext
  ): Promise<Serie> {
    return ctx.ds.transaction(async (trn) => {
      const metrPar = params.metricIds.map(i => {
        if (typeof i === "string") return parseInt(i)
        return i
      })
      const issuedAt = new Date()
      const bnds = this.buildBoundaries(params.fromUTC, params.toUTC, params.sampling)
      const bndsStr = JSON.stringify(bnds)
      const metricIdsStr  = JSON.stringify(metrPar)

      const metrics = await trn.getRepository(Metric).findBy({ id: In(metrPar)})

      const rawRows = await trn.query(sql, [bndsStr, metricIdsStr])
      const rows = rawRows.map((rr: any) => new SerieEntry(rr.metricId, rr.bucketEndUTC, rr.consumption))

      const ret = new Serie()
      ret.entries = rows
      ret.issuedAtUTCtimestamp = issuedAt
      ret.fromUTC = params.fromUTC
      ret.toUTC = params.toUTC
      ret.metrics = metrics
      ret.timeZone = TIMEZONE
      ret.sampling = params.sampling

      return ret
    })
  }

  buildBoundaries(fromUTC: Date, toUTC: Date, sampling: Sampling): Boundary[] {
    if (fromUTC >= toUTC) {
      throw new Error('From is younger than To')
    }

    const out: Boundary[] = []

    // Granularity - hours or quarter of hours
    if (sampling === Sampling.Q || sampling === Sampling.H) {
      const step = sampling === Sampling.Q ? 15 : 60
      let end = new Date(fromUTC)
      while (isBefore(end, toUTC) || isEqual(end, toUTC)) {
        const prev = addMinutes(end, -step)
        out.push({endTs: end, prevTs: prev})
        end = addMinutes(end, step)
      }
      return out
    }

    // Granularity - days
    if (sampling === Sampling.D) {
      let curLocal = startOfDay(toZonedTime(fromUTC, TIMEZONE))
      const endLocalLimit = startOfDay(toZonedTime(toUTC, TIMEZONE))
      while (isBefore(curLocal, endLocalLimit) || isEqual(curLocal, endLocalLimit)) {
        const endUTC  = fromZonedTime(curLocal, TIMEZONE)
        const prevUTC = fromZonedTime(addDays(curLocal, -1), TIMEZONE)
        out.push({endTs: endUTC, prevTs: prevUTC})
        curLocal = addDays(curLocal, 1)
      }
      return out
    }

    // Granularity - months
    let curLocal = startOfMonth(toZonedTime(fromUTC, TIMEZONE))
    const endLocalLimit = startOfMonth(toZonedTime(toUTC, TIMEZONE))
    while (isBefore(curLocal, endLocalLimit) || isEqual(curLocal, endLocalLimit)) {
      const endUTC  = fromZonedTime(curLocal, TIMEZONE)
      const prevUTC = fromZonedTime(addMonths(curLocal, -1), TIMEZONE)
      out.push({endTs: endUTC, prevTs: prevUTC})
      curLocal = addMonths(curLocal, 1)
    }
    return out
  }
}