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
    }
    Object.keys(teams).forEach(function (key) {
      console.log('launching bot for ' + key)
      launchBot(teams[key])
    })
  })
}

function launchBot (json) {
  const bot = slack.rtm.client()
  bot.message(function (event) {
    let handler
    try {
      handler = require('./events/' + event.type)
    } catch (e) {
      console.error('No handler for event type: ', event.type)
    }

    handler(event, function (err) {
      if (err) {
        console.error('Unexpected handler error: ', err)
      }
    })
  })
  bot.listen({token: JSON.parse(json).bot.bot_access_token})
}
