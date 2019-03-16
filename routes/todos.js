const express = require('express')
const router = express.Router()
const moment = require('moment')

const Todo = require('../models/todos')
const auth = require('../middleware/auth')
const verifyCreator = require('../middleware/verify-creator')
const validate = require('../middleware/validate')
const validateTodo = require('../middleware/validateTodo')

router.get('/todos', auth, async (req, res) => {

  try {
    // get user info
    const { user } = req

    // find todos by creator
    const todos = await Todo.find({ creator: user._id })

    // return todos
    res.render('todos', { todos, moment })
  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

router.get('/todos/new', auth, (req, res) => {
  res.render('new-todo')
})

router.post('/todos', [auth, validate(validateTodo)], async (req, res) => {
  try {

    // get title from the body
    const { title } = req.body

    // get user id
    const { _id } = req.user

    // create new todo
    const todo = new Todo({ title, creator: _id })

    // save todo
    await todo.save()
    
    // redirect to /todos  
    res.status(302).redirect('/todos')

  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

router.get('/todos/:id/edit', auth, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  verifyCreator(token).then((creator) => {
    Todo.findOne({ _id, creator }).then((todo) => {
      res.render('edit-todo', { todo })
    })
  })
})

router.patch('/todos/:id', auth, (req, res) => {
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

router.delete('/todos/:id', auth, (req, res) => {
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
