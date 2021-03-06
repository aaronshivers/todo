const Joi = require('joi')

module.exports = todo => {
  const schema = ({
    title: Joi.string().min(1).max(50).required(),
    completed: Joi.boolean()
  })
  return Joi.validate(todo, schema)
}
