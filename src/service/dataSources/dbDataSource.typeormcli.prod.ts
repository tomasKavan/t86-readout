import config from '../config'
import configureDataSource from './dbDataSource'

const ds = configureDataSource(config.db, true)

export default ds
