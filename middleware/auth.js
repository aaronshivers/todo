const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {

  try {
    // const token = req.header('x-auth-token')
    const token = req.cookies.token
    if (!token) return res.status(401).render('error', { msg: 'Access Denied! No Token Provided.' })

    const secret = process.env.JWT_SECRET
    
    const decoded = await jwt.verify(token, secret)
    req.user = decoded
    
    next()
  } catch (error) {
    res.status(400).render('error', { msg: 'Access Denied! Invalid Token.' })
  }
}
