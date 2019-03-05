const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET
    const token = req.header('x-auth-token')
debugger
    req.user = await jwt.verify(token, secret)

    next()
  } catch (err) {
    res.status(401).send('Access Denied! Please Log In.')
  }
}
