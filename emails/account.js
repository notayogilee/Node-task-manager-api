const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.YOUR_EMAIL,
    subject: 'Thanks for joining us!',
    text: `Welcome to the app, ${name}.  Let me know how you like the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.YOUR_EMAIL,
    subject: 'Sorry to hear you want to leave us.',
    text: `Hi ${name}, \nWe are sorry to hear that you want to leave. If there is anything we can improve on please let us know. \nYou are always welcome to come back anytime. \nLee`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}