import config from '../config'
import configureDataSource from './dbDataSource'

const ds = configureDataSource(config.db, true, {
  entities: ['src/service/models/**/*.ts'],
  migrations: ['src/service/migrations/**/*.ts']
})

export default ds
