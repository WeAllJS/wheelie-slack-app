'use strict'

const slack = require('slack')
const bluebird = require('bluebird')
const users = bluebird.promisifyAll(slack.users)
const Team = require('./team')

module.exports.get = (team, userId) => {
  let teamP
  if (typeof team === 'string') {
    teamP = Team.get(team)
  } else {
    teamP = bluebird.resolve(team)
  }
  return teamP.then(t => (
    users.infoAsync({
      token: t.access_token,
      user: userId
    }).then(res => res.user))
  )
}
