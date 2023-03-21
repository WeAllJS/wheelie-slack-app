'use strict'

const storage = require('./util/storage')
const Team = require('./models/team')
const slack = require('slack')

module.exports.listen = () => {
  const sub = storage()
  sub.on('message', (channel, team_id) => {
    Team.get(team_id).then(team => {
      launchBot(team, err => {
        if (err) {
          console.error('failure launching bot for ', team, err.message)
        }
      })
    })
  })
  sub.subscribe('team_auth')
  Team.getAll().then(teams => {
    if (!teams) {
      console.log('no registered teams')
    } else {
      Object.keys(teams).forEach(key => {
        console.log('launching bot for ' + key)
        launchBot(JSON.parse(teams[key]), err => {
          if (err) {
            console.error('failure launching bot for ', key, err.message)
          }
        })
      })
    }
  })
}

function launchBot (team, cb) {
  if (!team.bot) { return cb(new Error('team has no bot: ' + team)) }
  const bot = slack.rtm.client()
  console.log(`${team.team_id}: obtained RTM client`)

  const token = team.bot.bot_access_token
  console.log(`${team.team_id}: obtained bot access token`)
  bot.message(event => {
    let handlerPath
    try {
      handlerPath = require.resolve('./events/' + event.type.trim())
    } catch (e) {
      return console.error('No handler for bot event type: ', event.type)
    }

    try {
      require(handlerPath)({ event: event, team_id: team.team_id }, err => {
        if (err) {
          console.error('Unexpected handler error: ', err)
        }
      })
    } catch (e) {
      return console.error('Unexpected handler execution error:', e.message)
    }
  })
  try {
    bot.listen({token: token}, cb)
  } catch (e) {
    return console.error('slack.rtm.client().listen error: ', e.message)
  }
}
