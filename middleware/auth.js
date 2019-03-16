const jwt = require('jsonwebtoken')
const { User } = require('../models/users')

module.exports = async (req, res, next) => {

  try {

    // get token from cookies
    const token = req.cookies.token

    if (!token) return res.status(401).render('error', { msg: 'Access Denied! No Token Provided.' })

    const secret = process.env.JWT_SECRET
    
    const decoded = await jwt.verify(token, secret)

    // find user by id
    const user = await User.findById(decoded._id)

    if (!user) throw new Error()

    req.user = user

    next()
  } catch (error) {
    res.status(400).render('error', { msg: 'Access Denied! Invalid Token.' })
  }
}
