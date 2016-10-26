const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)

const cocTxt = process.env.COC_URL ? `<${process.env.COC_URL}|Code of Conduct>` : 'Code of Conduct'
const welcome_message_text = process.env.WELCOME_MESSAGE_TEXT || `Welcome! Review the ${cocTxt} before participating in the community.`
const send_welcome_message = process.env.SEND_WELCOME_MESSAGE === 'FALSE' ? false : true

module.exports = (data, cb) => {
  console.log('new user joined team: ', data)
  if (!send_welcome_message || !welcome_message_text) {
      return cb()
  }
  chat.postMessageAsync({
    token: data.token,
    channel: data.user.id,
    text: welcome_message_text
  }).then(() => {
     return cb()
  })
}

