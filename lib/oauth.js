const url = require('url')
const fetch = require('node-fetch')
const qs = require('querystring')
const redis = require('redis')

const client_id = process.env.SLACK_CLIENT_ID
const client_secret = process.env.SLACK_CLIENT_SECRET

module.exports = function (req, res, next) {
  const uri = 'https://' + req.header('Host') + '/oauth'
  console.log('authenticating with slack for ', uri)
  slackFetch('https://slack.com/api/oauth.access', {
    client_id,
    client_secret,
    redirect_uri: uri,
    code: url.parse(req.url, true).query.code
  }).then(function (body) {
    console.log('got a thing: ', body.access_token)
    if (body.access_token) {
      return body.access_token
    } else {
      throw new Error('No access token granted')
    }
  }).then(function (token) {
    console.log('testing the auth with token: ', token)
    return slackFetch('https://slack.com/api/auth.test', {
      token: token
    }).then(function () {
      const client = redis.createClient(process.env.REDISCLOUD_URL, {
        no_ready_check: true
      })
      client.set('auth-token', token, function () {
        res.send(200, 'all authenticated! yay!')
        client.quit()
        next()
      })
    })
  }).catch(function (err) {
    console.warn(err.stack || err)
    next(err)
  })
}

function slackFetch (url, args) {
  return fetch(url + '?' + qs.stringify(args)).then(function (res) {
    return res.json()
  }).then(function (body) {
    console.warn('got', body)
    if (body.ok) return body
    throw new Error(body.error)
  })
}
