'use strict'

// const storage = require('../util/storage')
// const reactions = require('bluebird').promisifyAll(require('slack').reactions)
const genderRoll = require('@inklesspen/genderrolls').genderRoll;
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const channelInfo = bluebird.promisify(slack.channels.info)
const Team = require('../models/team')

module.exports = (data, cb) => {
  cb(null)
  // console.log('new channel message: ', JSON.stringify(data, 2))

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
  if (data.event.text.includes('roll')) {
    // possibly a gender roll has been requested; let's check it against channel info

    return Team.get(data.team_id).then(team => team.bot.bot_access_token).then(
      token => {
        // This is as far as we can chain the promises, since we need the token
        // for multiple calls.
        return channelInfo({token: token, channel: data.event.channel}).then(
          channel => {
            // If the channel name starts with 'gender' or the purpose includes ['gr']
            // return the genderRoll result. Otherwise, return null; the channel
            // probably shouldn't have rolls in it.
            if (channel.startsWith('gender') || (
                channel.purpose && channel.purpose.value.includes('[gr]'))) {
              return genderRoll(data.event.text);
            }
            return null;
          }
        ).then(result => {
          if (result !== null) {
            return chat.postMessageAsync({
              token,
              channel: channel.id,
              text: result
            });
          }
          return null;
        })
      }
    ).asCallback(cb);

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
