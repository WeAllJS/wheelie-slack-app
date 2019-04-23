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

  return teamP.then(async team => {
    const token = team.bot.bot_access_token
    // note: not paginated

    const conversations = await slack.conversations.list({
      token,
      exclude_archived: 1,
      types: 'private_channel'
    });

    const channels = res.channels.filter(g => (
      (g.name.match(filter) || `#${g.name}`.match(filter) || g.purpose.value.match(filter)) &&
      !g.name.match(/^admin/i) &&
      !g.purpose.value.match(/\[secret\]/gi)
    ));

    const memberPopulatedChannelsP = await channels.map(async (g) => {
      // note: not paginated
      const res = await slack.conversations.members({
        token,
        channel: g.id
      });

      g.members = res.members;
      return g;
    });

    return Promise.all(memberPopulatedChannelsP);
  })
}
