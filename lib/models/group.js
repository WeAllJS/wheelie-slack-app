'use strict'

const Team = require('../models/team')
const slack = require('slack')
const bluebird = require('bluebird')

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
    return slack.conversations.list({
      token,
      exclude_archived: 1,
      types: 'private_channel'
    }).then(res => {
      console.log('returned', res);

      return res.conversations.filter(g => {
        console.log(`considering ${g.name}`);

        return (g.name.match(filter) || `#${g.name}`.match(filter) || g.purpose.value.match(filter)) &&
        !g.name.match(/^admin/i) &&
        !g.purpose.value.match(/\[secret\]/gi);
      })
    })
  })
}
