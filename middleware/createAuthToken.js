const jwt = require('jsonwebtoken')

module.exports = (user) => {
  const payload = { _id: user._id, isAdmin: user.isAdmin }
  const secret = process.env.JWT_SECRET

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, (err, token) => {
      if (err) return reject(err)

      return resolve(token)
    })
  })
}
