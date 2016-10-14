'use strict'

const qs = require('querystring')
const url = require('url')

module.exports = function (req, res, next) {
  const params = {
    client_id: process.env.SLACK_CLIENT_ID,
    scope: 'client',
    team: qs.parse(url.parse(req.url).query).team
  }
  const body = `<a href=https://slack.com/oauth/authorize?${qs.stringify(params)}>Click here to authorize an inviter user</a>`
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
  })
  res.write(body)
  res.end()
  next()
}
