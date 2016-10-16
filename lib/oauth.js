const url = require('url')
const storage = require('./util/storage')
const Team = require('./models/team')
const bluebird = require('bluebird')
const slack = require('slack')
const oauth = bluebird.promisifyAll(slack.oauth)
const auth = bluebird.promisifyAll(slack.auth)

const client_id = process.env.SLACK_CLIENT_ID
const client_secret = process.env.SLACK_CLIENT_SECRET

module.exports = (req, res, next) => {
  const uri = 'https://' + req.header('Host') + '/oauth'
  console.log('authenticating with slack for ', uri)
  return oauth.accessAsync({
    client_id,
    client_secret,
    redirect_uri: uri,
    code: url.parse(req.url, true).query.code
  }).then(body => {
    if (body.access_token) {
      return body
    } else {
      throw new Error('No access token granted')
    }
  }).then(body => {
    return auth.testAsync({
      token: body.access_token
    }).then(deets => {
      if (body.scope && body.scope.match(/client/g)) {
        // inviter setup
        console.log('setting up an inviter!')
        return Team.get(deets.team_id).then(team => {
          team.invite_token = body.access_token
          return team
        })
      } else {
        console.log('setting up a regular account')
        return body
      }
    }).then(team => Team.set(
      team.team_id, team
    ).then(() => {
      const pub = storage()
      pub.publish('team_auth', team.team_id)
      res.send(200, 'all authenticated!')
      next()
    }))
  }).catch(err => {
    console.warn(err.stack || err)
    next(err)
  })
}
