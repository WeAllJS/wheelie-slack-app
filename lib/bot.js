"use strict"

const storage = require('./util/storage')
const slack = require('slack')

module.exports.listen = function () {
  const sub = storage()
  const client = storage()
  sub.on('message', function (channel, team_id) {
    client.hgetAsync('teams', team_id).then(launchBot)
  })
  sub.subscribe('team_auth')
  client.hgetall('teams', function (err, teams) {
    if (err) {
      console.error('uhhh, error getting teams list: ', err)
    }
    if (!teams) {
      console.log('no registered teams')
    } else {
      Object.keys(teams).forEach(function (key) {
        console.log('launching bot for ' + key)
        launchBot(JSON.parse(teams[key]))
      })
    }
  })
}

function launchBot (team) {
  const bot = slack.rtm.client()
  const token = team.bot.bot_access_token
  bot.message(function (event) {
    let handler
    try {
      handler = require('./events/' + event.type.trim())
    } catch (e) {
      return console.error('No handler for event type: ', event.type)
    }

    handler({ event: event, team_id: team.team_id }, function (err) {
      if (err) {
        console.error('Unexpected handler error: ', err)
      }
    })
  })
  bot.listen({token: token})
}
