const express =  require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const { User, userValidator } = require('../models/users')
const validatePassword = require('../middleware/validate-password')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')

const cookieExpiration = { expires: new Date(Date.now() + 86400000) }

// POST /users
router.post('/users', validate(userValidator), async (req, res) => {
  const { email, password } = req.body

  try {
    // check db for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).render('error', { msg: 'User already registered.' })

    // create user
    const user = await new User({ email, password })

    // save user
    await user.save()

    // get auth token
    const token = await user.createAuthToken()

    // send welcome email
    if (process.env.NODE_ENV === 'development') {
      sendWelcomeEmail(email)
    }

    // set header and return user info
    res.cookie('token', token, cookieExpiration).status(201).render(`profile`, { user })

  } catch (error) {
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
    res.render('error', { msg: error.message })
  }
})

// GET /users/:id
router.get('/users/:id/view', auth, async (req, res) => {
  const { id } = req.params

  try {
    // find user by id
    const user = await User.findById(id)

    // reject if user not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })
    
    // return found user
    res.status(200).render('view', { user })
  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

// DELETE /users/:id
router.delete('/users/:id', auth, async (req, res) => {
  const { id } = req.params

  try {

    // find and delete user
    const user = await User.findByIdAndDelete(id)
    
    // reject if user was not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })
    
    // send cancellation email
    if (process.env.NODE_ENV === 'development') {
      sendCancelationEmail(user.email)
    }
    
    // redirect to /
    res.status(302).redirect('/')

  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

// GET /users/:id/edit
router.get('/users/:id/edit', auth, async (req, res) => {
  const { id } = req.params

  // find user by id
  const user = await User.findById(id)

  // render edit page with user
  res.render('edit', { user })
})

// PATCH /users/:id
router.patch('/users/:id', [auth, validate(userValidator)], async (req, res) => {

  const { email, password } = req.body
  const { id } = req.params
  
  try {
        
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
    console.log(error)
  }
})

// GET /users/profile
router.get('/users/profile', auth, async (req, res) => {
  try {
    const token = req.cookies.token
    const secret = process.env.JWT_SECRET
    const decoded = await jwt.verify(token, secret)

    // find user by id
    const user = await User.findById(decoded._id)

    // reject if user is not found
    if (!user) return res.status(404).render('error', { msg: 'User Not Found' })

    // send user data
    res.render('profile', { user })
  } catch (error) {
    res.render('error', { msg: error.message })
  }
})

// GET /login
router.get('/login', (req, res) => {
  res.render('login')
})

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {

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

    // set cookie and redirect to /users/profile
    res.cookie('token', token, cookieExpiration).status(200).redirect(`/users/profile`)
      
  } catch (error) {
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
  res.render('signup')
})

// GET /logout
router.get('/logout', (req, res) => {
  res.clearCookie('token').redirect(`/`)
})

module.exports = router
