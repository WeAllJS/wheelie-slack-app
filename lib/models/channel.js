'use strict'

const Team = require('../models/team')
const slack = require('slack')
const bluebird = require('bluebird')
const groups = bluebird.promisifyAll(slack.groups)
const channels = bluebird.promisifyAll(slack.channels)

module.exports.get = (team, channelId) => {
  let teamP
  if (typeof team === 'string') {
    teamP = Team.get(team)
  } else {
    teamP = bluebird.resolve(team)
  }
  return teamP.then(team => {
    const token = team.bot.bot_access_token
    const source = channelId.startsWith('C') ? channels : groups
    return source.infoAsync({
      token,
      channel: channelId
    }).then(info => info.channel || info.group)
  })
}

module.exports.getAll = (team, filter, includePrivate) => {
  filter = filter || /.*/
  let teamP
  if (typeof team === 'string') {
    teamP = Team.get(team)
  } else {
    teamP = bluebird.resolve(team)
  }
  return teamP.then(team => {
    const token = team.bot.bot_access_token
    return channels.listAsync({
      token,
      exclude_archived: 1
    }).then(res => {
      if (includePrivate) {
        return groups.listAsync({
          token,
          exclude_archived: 1
        }).then(gres => res.channels.concat(gres.groups))
      } else {
        return res.channels
      }
    }).then(chans => (
      chans.filter(c => (
        (c.name.match(filter) || c.purpose.value.match(filter)) &&
        !c.name.match(/^admin/i) &&
        !c.purpose.value.match(/\[secret\]/gi)
      ))
    ))
  })
}
