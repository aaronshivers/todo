const jwt = require('jsonwebtoken')

const authenticateUser = async (req, res, next) => {

  try {
    const token = req.cookies.token
    if (!token) return res.status(401).send('Access Denied! No Token Provided.')

    const secret = process.env.JWT_SECRET
    
    const decoded = await jwt.verify(token, secret)
    
    next()
  } catch (error) {
    res.status(400).send(error.message)
  }

  // if (token) {
  //   jwt.verify(token, secret, (err, decoded) => {
  //     if (err) {
  //       res.status(401).send(err.message)
  //     } else {
  //       next()
  //     }
  //   })
  // } else {
  //   res.status(401).send('You must login to view this page.')
  // }
}

module.exports = authenticateUser
