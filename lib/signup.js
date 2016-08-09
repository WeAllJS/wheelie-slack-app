const storage = require('./util/storage')
const slack = require('slack')
const bluebird = require('bluebird')
const qs = require('querystring')
const chat = bluebird.promisifyAll(slack.chat)

module.exports = function (req, res, next) {
  console.log('got an signup request!', req.body)
  const params = qs.parse(req.body)
  const client = storage()
  return client.hgetAsync('teams', params.team_id).then(function (json) {
    if (!json) {
      res.send(400, {error: 'team_not_found'})
      return next()
    }
    const team = JSON.parse(json)
    const token = team.bot.bot_access_token
    if (!token) throw new Error('no token for that team')
    return client.hsetAsync(`signups-${params.team_id}`, params.email, JSON.stringify({
      email: params.email,
      name: params.name,
      twitter: params.twitter,
      github: params.github,
      about: params.about
    }).then(function () {
      client.quit()
      const msg = composeMessage(token, params)
      return chat.postMessageAsync(msg)
    }).then(function () {
      if (!params.redirect_uri) {
        res.send(200, 'signup request sent')
        next()
      } else {
        res.redirect(params.redirect_uri, next)
      }
    }).catch(function (err) {
      res.send(500, {
        msg: err.message
      })
      next()
    })
  })
}

function composeMessage (token, params) {
  return {
    token,
    channel: 'admin-signups',
    text: 'New Signup!',
    attachments: [{
      title: params.email,
      fields: [{
        title: 'Twitter',
        value: params.twitter,
        short: true
      }, {
        title: 'GitHub',
        value: params.github,
        short: true
      }],
      author_name: params.name,
      author_icon: 'https://api.slack.com/img/api/homepage_custom_integrations-2x.png'
    }, {
      title: 'About Me',
      text: params.about
    }, {
      title: 'Would you like to invite this person?',
      callback_id: 'invite',
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [{
        name: 'invite',
        text: 'Invite',
        type: 'button',
        value: params.email
      }, {
        name: 'no',
        text: 'No',
        type: 'button',
        value: ''
      }]
    }]
  }
}
