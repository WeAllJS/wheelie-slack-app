const url = require('url')
const storage = require('./util/storage')
const bluebird = require('bluebird')
const slack = require('slack')
const oauth = bluebird.promisifyAll(slack.oauth)
const auth = bluebird.promisifyAll(slack.auth)

const client_id = process.env.SLACK_CLIENT_ID
const client_secret = process.env.SLACK_CLIENT_SECRET

module.exports = function (req, res, next) {
  const uri = 'https://' + req.header('Host') + '/oauth'
  console.log('authenticating with slack for ', uri)
  return oauth.accessAsync({
    client_id,
    client_secret,
    redirect_uri: uri,
    code: url.parse(req.url, true).query.code
  }).then(function (body) {
    if (body.access_token) {
      return body
    } else {
      throw new Error('No access token granted')
    }
  }).then(function (body) {
    const client = storage()
    return auth.testAsync({
      token: body.access_token
    }).then(function (deets) {
      if (body.scope && body.scope.match(/client/g)) {
        // inviter setup
        console.log('setting up an inviter!')
        return client.hgetAsync(
          'teams', deets.team_id
        ).then(json => {
          if (!json) { throw new Error('team does not exist') }
          const team = JSON.parse(json)
          team.invite_token = body.access_token
          return team
        })
      } else {
        console.log('setting up a regular account')
        return body
      }
    }).then(team => client.hsetAsync(
      'teams',
      team.team_id,
      JSON.stringify(team)
    ).then(() => {
      const pub = storage()
      pub.publish('team_auth', team.team_id)
      res.send(200, 'all authenticated!')
      next()
    }))
  }).catch(function (err) {
    console.warn(err.stack || err)
    next(err)
  })
}
