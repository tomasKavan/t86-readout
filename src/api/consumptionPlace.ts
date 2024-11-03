import express from 'express'
import { ConsumptionPlace } from '../models'

export default function (dataSource, config) {
  const router = express.Router()

  // LIST
  router.get('/', async (req, res) => {
    console.log(`[API]: Query ${req.path}`)
    const list = await dataSource.manager
      .createQueryBuilder(ConsumptionPlace, 'cp')
      .innerJoinAndSelect('cp.medium', 'me')
      .orderBy('cp.mbusPrimary')
      .getMany()
  
    res.json(list)
  })

  // DETAIL
  router.get('/:id', async (req, res) => {
    console.log(`[API]: Query ${req.path}`)
  
    const id = parseInt(req.params.id)
    console.log(id)
    if (typeof id !== 'number' || id < 0 || id > 250) {
      res.status(400)
      res.send('Invalid input param ID. Path should be /api/misto-spotreby/<ID>')
      return
    }
    const list = await dataSource.manager
      .createQueryBuilder(ConsumptionPlace, 'cp')
      .innerJoinAndSelect('cp.medium', 'me')
      .where('cp.mbusPrimary = :mbp', {mbp: id})
      .getOne()
  
    res.json(list)
  })

  return router
}