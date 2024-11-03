import express from 'express'
import { MeterType } from '../models'

export default function (dataSource, config) {
  const router = express.Router()

  // LIST
  router.get('/', async (req, res) => {
    console.log(`[API]: Query ${req.path}`)
    const list = await dataSource.manager
      .createQueryBuilder(MeterType, 'mt')
      .innerJoinAndSelect('mt.medium', 'me')
      .getMany()
    
    res.json(list)
  })

  return router
}
