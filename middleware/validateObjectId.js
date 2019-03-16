const { ObjectId } = require('mongodb')

// Validate ObjectId Middleware
module.exports = (req, res, next) => {

  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send('Invalid Id')
  }

  next()
}
