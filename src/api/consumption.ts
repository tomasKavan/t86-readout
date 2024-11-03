import express from 'express'
import { Meter } from '../models'

export default function (dataSource, config) {
  const router = express.Router()

  router.get('/sum/:from/:to', async (req, res) => {
    const fromD = new Date(req.params.from + 'T00:00')
    const toD = new Date(req.params.to + 'T00:00')
  
    if (!fromD || !(fromD instanceof Date) || !toD || !(toD instanceof Date)) {
      res.status(400)
      res.send('Invalid input params. Path should be /api/spotreba/<YYYY-MM-DD>/<YYYY-MM-DD>')
      return
    }
  
    fromD.setDate(fromD.getDate() + 1)
    toD.setDate(toD.getDate() + 2)
  
    console.log('[API]: Query /api/spotreba/:from/:to [' + fromD + ' - ' + toD + ']')
  
    const list = await AppDataSource.manager
      .createQueryBuilder(ConsumptionDaily, 'cd')
      .innerJoinAndSelect('cd.consumptionPlace', 'cp')
      .where('cd.time >= :od', {od: fromD})
      .andWhere('cd.time < :do', {do: toD})
      .getMany()
    
    const resData = {}
    for (const item of list) {
      let mb = resData[item.consumptionPlace.mbusPrimary]
      if (!mb) {
        mb = {
          mbus: item.consumptionPlace.mbusPrimary,
          sum: 0,
          days: []
        }
        resData[item.consumptionPlace.mbusPrimary] = mb
      }
      const date = new Date(item.time)
      //date.setDate(date.getDate() - 1)
      mb.sum += item.value
      mb.days.push({
        day: date.toISOString().substring(0,10),
        value: item.value
      })
    }
  
      res.json(resData)
  })

  // app.get(':od/:do/:step', async (req, res) => {
  //   const odD = new Date(req.params.od + 'T00:00')
  //   const doD = new Date(req.params.do + 'T00:00')
  //   const step = _getStep(req.params.step)

  //   if (!odD || !doD || !step) {
  //     res.status(400)
  //     res.send('Invalid input params. Path should be /api/stats/<YYYY-MM-DD>/<YYYY-MM-DD>/<qh|h|d|m|y>')
  //     return
  //   }
  // })

  // enum Steps {
  //   QHOUR = 'qh',
  //   HOUR = 'h',
  //   DAY = 'd',
  //   MONTH = 'm',
  //   YEAR = 'y'
  // }
  // function _getStep(str: string | null) : string | null {
  //   if (!str || !(str in Steps)) {
  //     return null
  //   }
  //   return str
  // }

  return router
}
