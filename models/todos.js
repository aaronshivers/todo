const mongoose = require('mongoose')

const Schema = mongoose.Schema

const todoSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: false,
    lowercase: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  completed: {
    type: Boolean,
    required: false,
    default: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true
  }
})

const Todo = mongoose.model('Todo', todoSchema)

module.exports = Todo
