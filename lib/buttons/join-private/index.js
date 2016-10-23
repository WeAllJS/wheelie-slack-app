const Team = require('../../models/team')
const Group = require('../../models/group')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)

module.exports.handler = (data) => {
  return Team.get(data.team.id).then(team => {
    const token = team.bot.bot_access_token
    return Group.get(team).then(chans => {
      const channelId = data.actions[0].value
      if (!channelId) {
        return {
          text: 'A channel is required. Use `/list-private` to see a list of available private channels.'
        }
      }
      const channel = chans.find(g => g.id === channelId)
      if (!channel) {
        return {
          text: 'Bad channel id'
        }
      }
      return chat.postMessageAsync({
        token,
        channel: channel.id,
        text: `Invite request from <@${data.user.id}>! Use \`/invite @${data.user.name}\` to accept (anyone here can do this)!`
      }).then(() => ({
        replace_original: false,
        text: `Invite request sent to #${channel.name}`
      }))
    })
  })
}
