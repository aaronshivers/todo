const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {

  try {
    const token = req.cookies.token
    const secret = process.env.JWT_SECRET

    // decode and verify token
    const decoded = await jwt.verify(token, secret)

    // reject if user is not admin
    if (!decoded.isAdmin) return res.status(401).send('Access Denied! Admin Only!')
  
    next()
  } catch (error) {
    res.status(401).send(error.message)
  }
}
