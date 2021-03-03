'use strict'

const Team = require('../models/team')
const slack = require('slack')
const bluebird = require('bluebird')
const conversations = bluebird.promisifyAll(slack.conversations)

module.exports.get = function (team, filter) {
  filter = filter || /.*/
  let teamP
  if (typeof team === 'string') {
    teamP = Team.get(team)
  } else {
    teamP = bluebird.resolve(team)
  }
  return teamP.then(team => {
    const token = team.bot.bot_access_token
    return conversations.listAsync({
      token,
      types: 'private_channel',
      exclude_archived: 1
    }).then(res => {
      const channels = res.channels.filter(g => (
        (g.name.match(filter) || `#${g.name}`.match(filter) || g.purpose.value.match(filter)) &&
        !g.name.match(/^admin/i) &&
        !g.purpose.value.match(/\[secret\]/gi)
      )).map(channel =>
        conversations.membersAsync({
          token, channel: channel.id
        }).then(res => {
          channel.members = res.ok ? res.members : []
          return channel
        })
      )
      return bluebird.Promise.all(channels)
    })
  })
}
