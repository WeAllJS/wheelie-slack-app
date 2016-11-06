'use strict'

const genderRoll = require('@inklesspen/genderrolls').genderRoll
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const Channel = require('../models/channel')
const Team = require('../models/team')

module.exports = (data, cb) => {
  // console.log('new channel message: ', JSON.stringify(data, 2))
  const roll = data.event.text && genderRoll(data.event.text)
  if (roll) {
    return Team.get(
      data.team_id
    ).then(team => {
      return Channel.get(
        team, data.event.channel
      ).then(channel => {
        // If the channel name starts with 'gender' or the purpose includes
        // [gr] return the genderRoll result. Otherwise, return null. The
        // channel probably shouldn't have rolls in it.
        if (channel.name.startsWith('gender') ||
            (channel.purpose && channel.purpose.value.includes('[gr]'))) {
          return chat.postMessageAsync({
            token: team.bot.bot_access_token,
            channel: channel.id,
            text: roll
          })
        }
      })
    }).asCallback(cb)
  }
  return cb(null)
}
