const redis = require('redis')
const fetch = require('node-fetch')
const qs = require('querystring')

module.exports = function (req, res, next) {
  console.log('got an admin request!', req.body)
  const params = qs.parse(req.body)
  const client = redis.createClient(process.env.REDISCLOUD_URL, {
    no_ready_check: true
  })
  client.get('auth-token', function (err, token) {
    if (err || !token) throw new Error('no token')
    const chan = (params.channel_name === 'directmessage')
    ? 'a DM'
    : params.channel_name
    slackFetch('https://slack.com/api/chat.postMessage', {
      token,
      channel: 'admin',
      text: `Message from ${params.user_name} in ${chan}:\n\n${params.text}`
    }).then(function () {
      res.send(200, {
        text: 'Admins have been notified. Please wait while they respond.'
      })
      next()
    }).catch(function (err) {
      res.send(500, {
        msg: err.message
      })
      next()
    })
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
