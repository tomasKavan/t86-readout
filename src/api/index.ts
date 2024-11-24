import express from 'express'
import meter from './meter'
import meterType from './meterType'
import medium from './medium'
import consumptionPlace from './consumptionPlace'
import consumption from './consumption'

export default function (dataSource, config) {
  const router = express.Router()

  router.use(auth)

  router.use('/data-serie', consumption(dataSource, config))
  router.use('/meter', meter(dataSource, config))
  router.use('/meter-type', meterType(dataSource, config))
  router.use('/medium', medium(dataSource, config))
  router.use('/consumption-place', consumptionPlace(dataSource, config))

  function auth(req, res, next) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
  
    if (login && password && login === config.user && password === config.secret) {
      return next()
    }

    res.set('WWW-Authenticate', 'Basic realm="Readout API"')
    res.status(401).send('Authentication required.')
  }
}