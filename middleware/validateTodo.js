const Joi = require('joi')

module.exports = todo => {
  const schema = ({
    title: Joi.string().min(1).max(50).required()
  })
  return Joi.validate(todo, schema)
}
