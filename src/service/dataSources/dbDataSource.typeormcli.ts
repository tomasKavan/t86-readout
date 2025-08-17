import config from '../config'
import configureDataSource from './dbDataSource'

console.log(config.db)

const ds = configureDataSource(config.db, true, {
  entities: ['dist-mig/service/models/**/*.js'],
  migrations: ['dist-mig/service/migrations/**/*.js']
})

export default ds
