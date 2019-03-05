const express = require('express')
const router = express.Router()

const Todo = require('../models/todos')
const authenticateUser = require('../middleware/authenticate-user')
const verifyCreator = require('../middleware/verify-creator')

router.get('/todos', authenticateUser, async (req, res) => {
  try {
    const { token } = req.cookies

    const creator = await verifyCreator(token)

    const todos = await Todo.find({ creator })

    res.render('todos', { todos })
  } catch (error) {
    res.status(400).send()
  }
})

router.get('/todos/new', authenticateUser, (req, res) => {
  res.render('new-todo')
})

router.post('/todos', authenticateUser, (req, res) => {
  const { token } = req.cookies

  verifyCreator(token).then((creator) => {
    const { title, completed } = req.body
    console.log(token)
    console.log(creator)
    const todo = new Todo({ title, completed, creator })
  
    todo.save().then(() => {
      res.redirect('/todos')
    })
  })
})

router.get('/todos/:id/edit', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  verifyCreator(token).then((creator) => {
    Todo.findOne({ _id, creator }).then((todo) => {
      res.render('edit-todo', { todo })
    })
  })
})

router.patch('/todos/:id', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id
  const update = { title, completed } = req.body

  verifyCreator(token).then((creator) => {
    const conditions = { _id, creator }

    Todo.findOneAndUpdate(conditions, update).then(() => {
      res.redirect('/todos')
    })
  })
})

router.delete('/todos/:id', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id
  

  verifyCreator(token).then((creator) => {
    const conditions = { _id, creator }

    Todo.findOneAndDelete(conditions).then((todo) => {
      res.redirect('/todos')
    })
  })
})

module.exports = router
