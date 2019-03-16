const express = require('express')
const router = express.Router()
const moment = require('moment')

const Todo = require('../models/todos')
const auth = require('../middleware/auth')
const verifyCreator = require('../middleware/verify-creator')

router.get('/todos', auth, async (req, res) => {

  try {
    // find todos by creator
    const todos = await Todo.find({ creator: req.user._id })

    // return todos
    res.render('todos', { todos, moment })
  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

// router.get('/todos', auth, (req, res) => {
//   const { token } = req.cookies
//   verifyCreator(token).then((creator) => {
//     Todo.find({ creator }).then((todos) => {
//       res.render('todos', { todos })
//     })
//   })
// })

router.get('/todos/new', auth, (req, res) => {
  res.render('new-todo')
})

router.post('/todos', auth, (req, res) => {
  const { token } = req.cookies

  verifyCreator(token).then((creator) => {
    const { title, completed } = req.body
    const todo = new Todo({ title, completed, creator })
  
    todo.save().then(() => {
      res.redirect('/todos')
    })
  })
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
