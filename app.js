require('dotenv').config()

const express = require('express')
const { mongoose, url } = require('./db/mongoose')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const methodOverride = require('method-override')
const compression = require('compression')
const winston = require('winston')
require('winston-mongodb')

const app = express()
const port = process.env.PORT

// Handle uncaught exceptions
winston.exceptions.handle(new winston.transports.File({ filename: 'uncaughtExceptions.log', level: 'error'}))
winston.exceptions.handle(new winston.transports.Console({ colorize: true, prettyPrint: true }))

//Handle unhandled rejections
process.on('unhandledRejection', exception => {
  throw exception.message
})

// Error Logging
winston.add(new winston.transports.Console({ colorize: true, prettyPrint: true }))
winston.add(new winston.transports.File({ filename: 'logfile.log', level: 'info' }))
winston.add(new winston.transports.MongoDB ({ db: url, level: 'info' }))


const indexRoutes = require('./routes/index')
const userRoutes = require('./routes/users')
const todoRoutes = require('./routes/todos')

app.set('view engine', 'ejs')

app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.use(indexRoutes)
app.use(userRoutes)
app.use(todoRoutes)

app.use((req, res, next) => {
  res.status(404).send('Sorry, we cannot find that!')
})

app.use((err, req, res, next) => {
  res.status(500).send(err.message)
})

app.listen(port, () => winston.info(`Server listening on port ${ port }.`))

module.exports = app
