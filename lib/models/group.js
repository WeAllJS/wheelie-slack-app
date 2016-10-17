'use strict'

const Team = require('../models/team')
const slack = require('slack')
const bluebird = require('bluebird')
const groups = bluebird.promisifyAll(slack.groups)

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
    return groups.listAsync({
      token,
      exclude_archived: 1
    }).then(res => (
      res.groups.filter(g => (
        (g.name.match(filter) || g.purpose.value.match(filter)) &&
        !g.name.match(/^admin/i) &&
        !g.purpose.value.match(/\[secret\]/gi)
      ))
    ))
  })
}
