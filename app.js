require('dotenv').config()

const express = require('express')
require('./db/mongoose')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const methodOverride = require('method-override')
const compression = require('compression')
const { logger } = require('./logger')

const app = express()
const port = process.env.PORT

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

app.use((req, res) => {
  res.status(404).send('Sorry, we cannot find that!')
})

app.use((err, req, res) => {
  res.status(500).send(err.message)
})

app.listen(port, () => logger.info(`Server listening on port ${ port }.`))

module.exports = app
