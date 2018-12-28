const express = require('express')
const router = express.Router()

const Todo = require('../models/todo-model')

router.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.render('todos', { todos })
  })
})

router.get('/todos/new', (req, res) => {
  res.render('new-todo')
})

router.post('/todos', (req, res) => {
  const { title, completed } = req.body
  const todo = new Todo({ title, completed })

  todo.save().then(() => {
    res.redirect('/todos')
  })
})

router.get('/todos/:id/edit', (req, res) => {
  const { id } = req.params

  Todo.findById(id).then((todo) => {
    res.render('edit-todo', { todo })
  })
})

router.patch('/todos/:id', (req, res) => {
  const { id } = req.params
  const update = { title, completed } = req.body

  Todo.findByIdAndUpdate(id, update).then(() => {
    res.redirect('/todos')
  })
})

router.delete('/todos/:id', (req, res) => {
  const { id } = req.params

  Todo.findByIdAndDelete(id).then((todo) => {
    res.redirect('/todos')
  })
})

module.exports = router
