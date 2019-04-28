const express =  require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const { User, userValidator } = require('../models/users')
const Todo = require('../models/todos')
const validatePassword = require('../middleware/validate-password')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId')

// POST /users
router.post('/users', validate(userValidator), async (req, res) => {

  try {
    // get email and password from the body
    const { email, password } = req.body

    // check db for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).render('error', { msg: 'User already registered.' })

    // create user
    const user = await new User({ email, password })

    // save user
    await user.save()

    // get auth token
    const token = await user.createAuthToken()

    // reject if token wasn't created
    if (!token) return res.status(500).render('error', { msg: 'Server Error: Token Not Created' })

    // send welcome email
    if (process.env.NODE_ENV === 'development') {
      sendWelcomeEmail(email)
    }

    // set cookie options
    const cookieOptions = { expires: new Date(Date.now() + 86400000), httpOnly: true  }

    // set header and return user info
    res.cookie('token', token, cookieOptions).status(201).render(`profile`, { user })

  } catch (error) {

    // send error message
    res.status(400).render('error', { msg: error.message })
  }
})

// GET /users
router.get('/users', auth, async (req, res) => {

  try {

    // verify isAdmin === true
    if (!req.user.isAdmin) return res.status(401).render('error', { msg: 'Access Denied! Admin Only!' })

    // find users
    const users = await User.find()
      
    // reject if no users found
    if (users.length === 0) return res.status(404).render('error', { msg: 'No Users Found' })
        
    // return users
    res.render('users', { users })

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// GET /users/:id/view
router.get('/users/:id/view', [auth, validateObjectId], async (req, res) => {

  try {

    // get user id
    const { id } = req.params

    // verify that user is an admin
    if (!req.user.isAdmin) return res.status(401).render('error', { msg: 'Access Denied! Admin Only!' })

    // find user by id
    const user = await User.findById(id)

    // reject if user not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })
    
    // return found user
    res.status(200).render('view', { user })

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// DELETE /users/:id
router.delete('/users/:id', [auth, validateObjectId], async (req, res) => {

  try {

    // get user info
    const { user } = req

    // find and delete user
    const deletedUser = await req.user.remove()
    // const deletedUser = await User.findByIdAndDelete(user._id)

    // reject if user was not found
    if (!deletedUser) return res.status(404).render('error', { msg: 'User Not Found' })

    // send cancellation email
    if (process.env.NODE_ENV === 'development') {
      sendCancelationEmail(user.email)
    }
    
    // delete cookie and redirect to /
    res.status(302).clearCookie('token').redirect('/')

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// GET /users/:id/edit
router.get('/users/:id/edit', [auth, validateObjectId], async (req, res) => {

  try {

    // get user id
    const { id } = req.params

    // verify that user is admin or account owner
    if (!req.user.isAdmin && id !== req.user._id.toString()) return res.status(401).render('error', { msg: 'Access Denied!' })

    // find user by id
    const user = await User.findById(id)

    // render edit page with user
    res.render('edit', { user })

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// PATCH /users/:id
router.patch('/users/:id', [auth, validate(userValidator)], async (req, res) => {

  try {

    // get email and password
    const { email, password } = req.body

    // get user id
    const { id } = req.params

    // verify that user is either the account owner or an admin
    if (!req.user.isAdmin && id !== req.user._id.toString()) return res.status(401).render('error', { msg: 'Access Denied! Admin Only!' })

    // hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    // check for duplicate user
    const duplicateUser = await User.findOne({ email })

    // reject if duplicate user
    if (duplicateUser) return res.status(400).render('error', { msg: 'User Already Exists' })

    // set updates and options
    const updates = { email, password: hash }
    const options = { new: true, runValidators: true }

    // update user
    const user = await User.findByIdAndUpdate(id, updates, options)

    // reject if no user is found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })

    // redirect to users/profile
    res.status(201).redirect(`/users/profile`)

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// GET /users/profile
router.get('/users/profile', auth, async (req, res) => {

  try {

    // find user by id
    const user = await User.findById(req.user._id)

    // reject if user is not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })

    // send user data
    res.render('profile', { user })

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })  }
})

// GET /login
router.get('/login', (req, res) => {

  // render login page
  res.render('login')
})

// POST /login
router.post('/login', async (req, res) => {

  try {

    // get email and password
    const { email, password } = req.body

    // find user by email
    const user = await User.findOne({ email })

    // reject if user is not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })
    
    // verify user password
    const hash = await bcrypt.compare(password, user.password)
    
    // reject if password is incorrect
    if (!hash) return res.status(401).render('error', { msg: 'Please check your login credentials, and try again.' })
    
    // create token
    const token = await user.createAuthToken()

    // reject if token wasn't created
    if (!token) return res.status(500).render('error', { msg: 'Server Error: Token Not Created' })

    // set cookie options
    const cookieOptions = { expires: new Date(Date.now() + 86400000) }

    // set cookie and redirect to /users/profile
    res.cookie('token', token, cookieOptions).status(200).redirect(`/users/profile`)
      
  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })
  }
})

// GET /admin
router.get('/admin', auth, (req, res) => {

  // verify isAdmin === true
  if (!req.user.isAdmin) return res.status(401).render('error', { msg: 'Access Denied! Admin Only!' })

  // render admin page
  res.render('admin')
})

// GET /signup
router.get('/signup', (req, res) => {

  // render signup page
  res.render('signup')
})

// GET /logout
router.get('/logout', (req, res) => {

  // delete cookie and redirect to /
  res.clearCookie('token').redirect(`/`)
})

module.exports = router
