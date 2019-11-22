const postmark = require('postmark')

const serverToken = process.env.POSTMARK_TOKEN

// Send an email:
const client = new postmark.ServerClient(serverToken)

const sendReminderEmail = (email, todos) => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Todo Reminder',
    "TextBody": `You have ${ todos.length } todo(s) left.`
  })
}

module.exports = sendReminderEmail
