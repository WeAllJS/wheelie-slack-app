const restify = require('restify')
const button = require('./lib/button')
const admin = require('./lib/admin')
const event = require('./lib/event')
const oauth = require('./lib/oauth')

const server = restify.createServer()

server.use(restify.bodyParser())
// server.use(function (req, res, next) {
//   if (!req.body ||
//       !req.body.token ||
//       req.body.token !== process.env.VERIFICATION_TOKEN) {
//     res.send(403)
//     next(new Error('bad request token'))
//   } else {
//     next()
//   }
// })

server.get('/', function (req, res, next) {
  const body = `<a href="https://slack.com/oauth/authorize?scope=incoming-webhook,commands,channels:history,channels:read,emoji:read,groups:read,groups:history,reactions:read,reactions:write,users:read,chat:write:bot&client_id=64894231568.65752863537"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`
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
server.post('/event', event)
server.get('/oauth', oauth)

server.listen(process.env.PORT)
