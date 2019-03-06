const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET
    const token = req.header('x-auth-token')
    if (!token) return res.status(401).send('!!!Access Denied! No Token Provided.')

    req.user = await jwt.verify(token, secret)

    next()
  } catch (err) {
    res.status(400).send('Access Denied! Invalid Token.')
  }
}
