const storage = require('./util/storage')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const qs = require('querystring')

module.exports = function (req, res, next) {
  console.log('got an admin request!', req.body)
  const params = qs.parse(req.body)
  return adminMsg(params).then(function () {
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
}

const adminMsg = module.exports.adminMsg = function (params) {
  const client = storage()
  return client.hgetAsync('teams', params.team_id).then(function (json) {
    const token = JSON.parse(json).bot.bot_access_token
    if (!token) throw new Error('no token for that team')
    if (params.token !== process.env.VERIFICATION_TOKEN) {
      throw new Error('invalid verification token')
    }
    const chan = (params.channel_name === 'directmessage')
    ? 'a DM'
    : (params.channel_name) === 'privategroup'
    ? 'a private channel'
    : `<#${params.channel_id}>`
    return chat.postMessageAsync({
      token,
      channel: 'admin',
      text: `Message from <@${params.user_id}> in ${chan}:\n\n${params.text}`
    })
  })
}
