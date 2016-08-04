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
    console.log('got a thing: ', body.access_token)
    if (body.access_token) {
      return body
    } else {
      throw new Error('No access token granted')
    }
  }).then(function (body) {
    console.log('testing the auth with token: ', body.access_token)
    return auth.testAsync({
      token: body.access_token
    }).then(function () {
      const client = storage()
      return Promise.all([
        client.setAsync('auth-token', body.access_token),
        client.setAsync('bot-auth-token', body.bot.bot_access_token),
        client.setAsync('bot-user-id', body.bot.bot_user_id)
      ]).then(function () {
        res.send(200, 'all authenticated!')
        client.quit()
        next()
      })
    })
  }).catch(function (err) {
    console.warn(err.stack || err)
    next(err)
  })
}
