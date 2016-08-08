const url = require('url')
const storage = require('./util/storage')
const bluebird = require('bluebird')
const slack = require('slack')
const oauth = bluebird.promisifyAll(slack.oauth)
const auth = bluebird.promisifyAll(slack.auth)

const client_id = process.env.SLACK_CLIENT_ID
const client_secret = process.env.SLACK_CLIENT_SECRET
const hacky_invite_token = process.env.SLACK_INVITE_TOKEN

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
      body.invite_token = hacky_invite_token
      return body
    } else {
      throw new Error('No access token granted')
    }
  }).then(function (body) {
    return auth.testAsync({
      token: body.access_token
    }).then(function (deets) {
      const client = storage()
      const pub = storage()
      return client.hsetAsync(
        'teams',
        deets.team_id,
        JSON.stringify(body)
      ).then(function () {
        pub.publish('team_auth', deets.team_id)
        res.send(200, 'all authenticated!')
        next()
      })
    })
  }).catch(function (err) {
    console.warn(err.stack || err)
    next(err)
  })
}
