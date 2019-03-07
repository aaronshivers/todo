const express =  require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const { User, userValidator } = require('../models/users')
const validatePassword = require('../middleware/validate-password')
const createToken = require('../middleware/create-token')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')

const cookieExpiration = { expires: new Date(Date.now() + 86400000) }

// POST /users
router.post('/users', async (req, res) => {
  const { email, password } = req.body

  try {
    // check db for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).send('User already registered.')

    // validate password
    const validPass = await validatePassword(password)
    if (!validPass) return res.status(400).send('Password must contain 8-100 characters, with at least one lowercase letter, one uppercase letter, one number, and one special character.')

    // create user
    const user = await new User({ email, password })

    // save user
    const fart = await user.save()

    // get auth token
    const token = await createToken(user)

    // send welcome email
    if (process.env.NODE_ENV === 'development') {
      sendWelcomeEmail(email)
    }

    // set header and return user info
    res.cookie('token', token, cookieExpiration).status(201).render(`profile`, { user })

  } catch (error) {
    res.status(400).send(error)
  }
})

// GET /users
router.get('/users', auth, async (req, res) => {

  try {

    // verify isAdmin === true
    if (!req.user.isAdmin) return res.status(401).send('Access Denied! Admin Only!')

    // find users
    const users = await User.find()
      
    // reject if no users found
    if (users.length === 0) return res.status(404).send('No Users Found')
        
    // return users
    res.render('users', { users })

  } catch (error) {
    res.send(error.message)
  }
})

// GET /users/:id
router.get('/users/:id/view', auth, async (req, res) => {
  const { id } = req.params

  try {
    // find user by id
    const user = await User.findById(id)

    // reject if user not found
    if (!user) return res.status(404).send('Sorry, that user id is not in our database.')
    
    // return found user
    res.status(200).render('view', { user })
  } catch (error) {
    res.send(error.message)
  }
})

// DELETE /users/:id
router.delete('/users/:id', auth, (req, res) => {
  const { id } = req.params

  User.findByIdAndDelete(id).then((user) => {
    if (user) {
      // send cancellation email
      if (process.env.NODE_ENV === 'development') {
        sendCancelationEmail(user.email)
      }
      res.send(user)
    } else {
      res.status(404).send('Sorry, that user Id was not found in our database.')
    }
  })
})

// GET /users/:id/edit
router.get('/users/:id/edit', auth, (req, res) => {
  const { id } = req.params

  User.findById(id).then((user) => {
    res.render('edit', { user })
  })
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
    if (duplicateUser) return res.status(400).send('User Already Exists')

    // set updates and options
    const updates = { email, password: hash }
    const options = { new: true, runValidators: true }

    // update user
    const user = await User.findByIdAndUpdate(id, updates, options)

    // reject if no user is found
    if (!user) return res.status(404).send('User Not Found')

    // redirect to users/profile
    res.status(201).redirect(`/users/profile`)

  } catch (error) {
    console.log(error)
  }
})

// GET /profile
router.get('/profile', auth, async (req, res) => {
  try {
    const token = req.cookies.token
    const secret = process.env.JWT_SECRET
    const decoded = await jwt.verify(token, secret)

    // find user by id
    const user = await User.findById(decoded._id)

    // reject if user is not found
    if (!user) return res.status(404).send('User Not Found')

    // send user data
    res.render('profile', { user })
  } catch (error) {
    res.send(error.message)
  }
})

// GET /login
router.get('/login', (req, res) => {
  res.render('login')
})

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  User.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          createToken(user).then((token) => {
            res.cookie('token', token, cookieExpiration).status(200).redirect(`/profile`)
          })
        } else {
          res.status(401).send('Please check your login credentials, and try again.')
        }
      })
    } else {
      res.status(404).send('Sorry, we could not find that user in our database.')
    }
  }).catch(err => res.status(401).send('Please check your login credentials, and try again.'))
})

// GET /admin
router.get('/admin', auth, (req, res) => {
  // verify isAdmin === true
  if (!req.user.isAdmin) return res.status(401).send('Access Denied! Admin Only!')

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
