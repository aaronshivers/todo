const jwt = require('jsonwebtoken')

const createToken = (user) => {
  const payload = { _id: user._id, isAdmin: user.isAdmin }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '1d' }

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err)

      return resolve(token)
    })
  })
}

module.exports = createToken
