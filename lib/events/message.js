'use strict'

// const storage = require('../util/storage')
// const reactions = require('bluebird').promisifyAll(require('slack').reactions)

module.exports = (data, cb) => {
  //console.log('new channel message: ', JSON.stringify(data, 2))

  // const name = checkDzy(data.event)
  // ? 'dizzy_face'
  // : data.event.subtype === 'message_changed' && data.event.message.attachments
  // ? 'ok_hand'
  // : ''
  // reactji(name, data).then(function () {
  //   cb()
  // }).catch(function (e) {
  //   cb(e)
  // })
}

// function checkDzy (msg) {
//   if (msg.subtype === 'message_changed' && msg.message.attachments) {
//     const attachments = msg.message.attachments
//     for (let i = 0; i < attachments.length; i++) {
//       if (attachments[i].is_animated) {
//         return true
//       }
//     }
//   }
//   return false
// }
//
// function reactji (name, msg) {
//   console.log(`adding :${name}: reactji to message`)
//   const client = storage()
//   return client.hgetAsync('teams', msg.team_id).then(function (json) {
//     client.quit()
//     const token = JSON.parse(json).bot.bot_access_token
//     if (!token) throw new Error('no token for that team')
//     if (!name) return
//     return reactions.addAsync({
//       token: token,
//       name: name,
//       channel: msg.event.channel,
//       timestamp: msg.event.message.ts
//     })
//   })
// }
