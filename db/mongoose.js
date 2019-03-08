const mongoose = require('mongoose')
const winston = require('winston')

const username = process.env.MONGO_USER
const password = process.env.MONGO_PASS
const encodedpass = encodeURIComponent(password)
const server = process.env.MONGO_SERVER
const database = process.env.MONGO_COLLECTION
const url = `mongodb://${username}:${encodedpass}@${server}/${database}`

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose.connect(url)
  .then(() => winston.info(`Connected to ${ process.env.NODE_ENV } Database`))

module.exports = { mongoose, url }
