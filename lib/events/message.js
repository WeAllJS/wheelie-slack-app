'use strict'

const genderRoll = require('@inklesspen/genderrolls').genderRoll
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const channelInfo = bluebird.promisify(slack.channels.info)
const Team = require('../models/team')

module.exports = (data, cb) => {
  // console.log('new channel message: ', JSON.stringify(data, 2))
  if (data.event.text.includes('roll')) {
    return Team.get(
      data.team_id
    ).then(team =>
      team.bot.bot_access_token
    ).then(token => {
      return channelInfo({
        token: token, channel: data.event.channel
      }).then(info => {
        const channel = info.channel
        // If the channel name starts with 'gender' or the purpose includes
        // [gr] return the genderRoll result. Otherwise, return null. The
        // channel probably shouldn't have rolls in it.
        if (channel.name.startsWith('gender') ||
            (channel.purpose && channel.purpose.value.includes('[gr]'))) {
          return chat.postMessageAsync({
            token,
            channel: channel.id,
            text: genderRoll(data.event.text)
          })
        }
      })
    }).asCallback(cb)
  }
  return cb(null)
}
