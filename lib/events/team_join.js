//const Group = require('../models/group')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)

const cocTxt = process.env.COC_URL ? `<${process.env.COC_URL}|Code of Conduct>` : 'Code of Conduct'
const welcome_message_text = process.env.WELCOME_MESSAGE_TEXT || `Welcome! Review the ${cocTxt} before participating in the community.`
const send_welcome_message = process.env.SEND_WELCOME_MESSAGE === 'FALSE' ? false : true

module.exports.command = 'join-private [channel]'
module.exports.desc = 'Invites user to the given channel, or lists them.'

module.exports = (token, data, cb) => {
  console.log('new user joined team: ', data)
  console.log(send_welcome_message, welcome_message_text)
  if (!send_welcome_message || !welcome_message_text) {
      return (cb ? cb() : undefined)
  }
  chat.postMessageAsync({
    token,
    channel: data.user.id,
    text: welcome_message_text
  }).then(() => {
     return (cb ? cb() : undefined)
  })
}

