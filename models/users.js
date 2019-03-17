const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const Todo = require('./todos')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 8,
    maxlength: 100,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email address.`
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 100
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
})

// hash plain text passwords
userSchema.pre('save', async function(next) {
  const user = this
  const saltingRounds = 10

  if (user.isModified || user.isNew) {
    try {
      const hash = await bcrypt.hash(user.password, saltingRounds)
      user.password = hash
    } catch (error) {
      next(error)
    }
  }
  next()
})

// remove user todos when user is removed
userSchema.pre('remove', async function(next) {
  const user = this
  await Todo.deleteMany({ creator: user._id })
  next()
})

userSchema.methods.createAuthToken = function () {
  const user = this
  const payload = { _id: user._id, isAdmin: user.isAdmin }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '2d' }
  return jwt.sign(payload, secret, options)
}

const userValidator = user => {
  const regex = /((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,100}/

  const schema = ({
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().regex(regex).required().error(() => {
      return `Password must contain 8-100 characters, with at least one 
      lowercase letter, one uppercase letter, one number, and one special character.`
    })
  })
  return Joi.validate(user, schema)
}


const User = mongoose.model('User', userSchema)

module.exports = { User, userValidator}
