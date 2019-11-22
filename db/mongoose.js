const mongoose = require('mongoose')
const { logger, winston } = require('../logger.js')

const {
  MONGO_USER,
  MONGO_PASS,
  MONGO_SERVER,
  MONGO_COLLECTION
} = process.env

const encodedPass = encodeURIComponent(MONGO_PASS)
const url = `mongodb://${ MONGO_USER }:${ encodedPass }@${ MONGO_SERVER }/${ MONGO_COLLECTION }`

options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}

logger
  .add(
    new winston
      .transports
      .MongoDB({
        db: url
      })
  )

mongoose.connect(url, options)
  .then(() => logger.info(`Connected to ${ process.env.NODE_ENV } Database`))

module.exports = { mongoose, url }
