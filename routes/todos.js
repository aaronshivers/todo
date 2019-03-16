const express = require('express')
const router = express.Router()
const moment = require('moment')

const Todo = require('../models/todos')
const auth = require('../middleware/auth')
const verifyCreator = require('../middleware/verify-creator')
const validate = require('../middleware/validate')
const validateTodo = require('../middleware/validateTodo')
const validateObjectId = require('../middleware/validateObjectId')

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

router.get('/todos/:id/edit', [auth, validateObjectId], async (req, res) => {
  
  try {

    // get user info
    const { user } = req

    // get todo id
    const { id } = req.params

    // find todo by todo id and user id
    const todo = await Todo.findOne({ _id: id, creator: user._id })
    
    // reject if todo is not found in the DB
    if (!todo) return res.status(404).render('error', { msg: 'Todo Not Found' })

    // render todo data
    res.render('edit-todo', { todo })

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })

  }

})

router.patch('/todos/:id', [auth, validateObjectId, validate(validateTodo)], async (req, res) => {
  
  try {
    // get todo id
    const _id = req.params.id

    // get title and status
    const update = { title, completed } = req.body

    // get user data
    const { user } = req

    // create update
    const conditions = { _id, creator: user._id }

    // update todo
    const updatedTodo = await Todo.findOneAndUpdate(conditions, update)
    
    // reject if todo is not updated
    if (!updatedTodo) return res.status(404).render('error', { msg: 'Todo Could Not Be Updated' })

    // redirect after updating
    res.redirect('/todos')

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })

  }
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
