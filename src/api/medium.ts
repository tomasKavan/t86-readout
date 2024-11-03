import express from 'express'
import { Medium } from '../models'

export default function (dataSource, config) {
  const router = express.Router()

  // LIST
  router.get('/', async (req, res) => {
    console.log(`[API]: Query ${req.path}`)
    const list = await dataSource.manager
      .createQueryBuilder(Medium, 'm')
      .getMany()
    
    res.json(list)
  })

  return router
}