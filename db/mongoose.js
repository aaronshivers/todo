const mongoose = require('mongoose')
const winston = require('winston')

const {
  MONGO_USER,
  MONGO_PASS,
  MONGO_SERVER,
  MONGO_COLLECTION,
  NODE_ENV
} = process.env

const encodedpass = encodeURIComponent(MONGO_PASS)
const url = `mongodb://${ MONGO_USER }:${ encodedpass }@${ MONGO_SERVER }/${ MONGO_COLLECTION }`

options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}

mongoose.connect(url, options)
  .then(() => winston.info(`Connected to ${ process.env.NODE_ENV } Database`))

module.exports = { mongoose, url }
