import express from 'express'
import { Meter } from '../models'

export default function (dataSource, config) {
  const router = express.Router()

  // LIST
  router.get('/', async (req, res) => {
    console.log(`[API]: Query ${req.path}`)
    const list = await dataSource.manager
      .createQueryBuilder(Meter, 'm')
      .innerJoinAndSelect('m.type', 'mt')
      .innerJoinAndSelect('m.installations', 'i')
      .innerJoinAndSelect('i.consumptionPlace', 'cp')
      .orderBy('m.id')
      .getMany()
    
    res.json(list)
  })

  return router
}
