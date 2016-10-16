const restify = require('restify')
const button = require('./lib/button')
const admin = require('./lib/admin')
const signup = require('./lib/signup')
const event = require('./lib/event')
const oauth = require('./lib/oauth')
const bot = require('./lib/bot')
const installInviter = require('./lib/install-inviter')

const server = restify.createServer()

server.use(restify.bodyParser())

const scopes = [
  'incoming-webhook',
  'commands',
  'bot',
  'chat:write:user'
]

server.get('/install', (req, res, next) => {
  const body = `<a href="https://slack.com/oauth/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopes}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
  })
  res.write(body)
  res.end()
  next()
})
server.post('/button', button)
server.post('/admin', admin)
server.post('/signup', signup)
server.post('/event', event)
server.get('/oauth', oauth)
server.get('/install-inviter', installInviter)

bot.listen()
server.listen(process.env.PORT)
