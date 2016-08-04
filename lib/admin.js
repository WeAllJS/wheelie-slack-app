const storage = require('./util/storage')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const qs = require('querystring')

module.exports = function (req, res, next) {
  console.log('got an admin request!', req.body)
  const params = qs.parse(req.body)
  const client = storage()
  return client.getAsync(`${params.team_id}-bot-access-token`).then(function (token) {
    if (!token) throw new Error('no token for that team')
    if (params.token !== process.env.VERIFICATION_TOKEN) {
      throw new Error('invalid verification token')
    }
    const chan = (params.channel_name === 'directmessage')
    ? 'a DM'
    : (params.channel_name) === 'privategroup'
    ? 'a private channel'
    : params.channel_name
    return chat.postMessageAsync({
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
