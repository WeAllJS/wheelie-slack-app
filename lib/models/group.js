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
    // note: not paginated
    return slack.conversations.list({
      token,
      exclude_archived: 1,
      types: 'private_channel'
    }).then(res => (
      res.channels.filter(g => (
        (g.name.match(filter) || `#${g.name}`.match(filter) || g.purpose.value.match(filter)) &&
        !g.name.match(/^admin/i) &&
        !g.purpose.value.match(/\[secret\]/gi)
      )).map((g) => {
        // note: not paginated
        const res = await slack.conversations.members({
          token,
          channel: g.id
        });

        g.members = res.members;
        return g;
      })
    ))
  })
}
