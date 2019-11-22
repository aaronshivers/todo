const validatePassword = (password) => {
  const regex = /((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,100}/
  return !!password.match(regex)
}

module.exports = validatePassword
