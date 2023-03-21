const restify = require('restify')

const command = require('./lib/res/command')
const install = require('./lib/res/install')
const button = require('./lib/res/button')
const signup = require('./lib/res/signup')
const event = require('./lib/res/event')
const oauth = require('./lib/res/oauth')
const installInviter = require('./lib/res/install-inviter')

console.log(`invoking bot.listen()...`)
require('./lib/bot').listen()

const server = restify.createServer()

const scopes = [
  'incoming-webhook',
  'commands',
  'bot',
  'chat:write:user'
]

server.use(restify.bodyParser())
const resources = [
  command('/command'),
  install('/install', scopes),
  button('/button'),
  signup('/signup'),
  event('/event'),
  oauth('/oauth'),
  installInviter('/install-inviter')
]
resources.map(r => r(server))

console.log(`finished configuring routes; starting listen on port ${process.env.PORT}`)
server.listen(process.env.PORT)
