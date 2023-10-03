import { Sequelize } from 'sequelize'
import { defineModels } from './models/defineModels'
import EnvVars from '@config/EnvVars'

// de tipo any para poder eliminar getConnection 
let sequelize = <Sequelize | any>null

export const open = async () => {
  if (sequelize) {
    sequelize.connectionManager.initPools()
    if (sequelize.connectionManager.hasOwnProperty('getConnection')) {
      delete sequelize.connectionManager['getConnection']
    }
  }

  sequelize = new Sequelize(
    EnvVars.dbName,
    EnvVars.dbUser,
    EnvVars.dbPass,
    {
      host: EnvVars.dbHost,
      dialect: 'mysql',
      dialectOptions: { ssl: 'Amazon RDS' },
      pool: {
        min: 0,
        max: 10,
        idle: 0,
        acquire: 3000,
        evict: 3000
      },
      port: EnvVars.dbport,
      logging: false
    }
  )

  defineModels(sequelize)
  await sequelize.sync({ force: false })
}

export const close = async () => {
  try {
    if (!sequelize) return
    await sequelize.connectionManager.close()
  } catch (error) {
    console.error(error)
  }
}

export const getModels = () => {
  if (!sequelize) throw new Error('NO se ha creado sequelize')
  if (!(sequelize instanceof Sequelize)) throw new Error('NO es de tipo Sequelize')
  return sequelize.models
}

export default { open, close, getModels }