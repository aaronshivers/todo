const winston = require('winston')
const { mongoose, url } = require('./db/mongoose')
require('winston-mongodb')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston
      .transports
      .File({
        filename: 'error.log',
        level: 0
      }),
    new winston
      .transports
      .File({
        filename: 'logfile.log'
      })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger
    .add(
      new winston
        .transports
        .Console({
          format: winston.format.simple()
        })
    )
}

module.exports = { logger, winston }
