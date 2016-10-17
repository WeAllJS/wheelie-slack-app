const Team = require('../models/team')
const Group = require('../models/group')
const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)

module.exports.command = 'join-private [channel['
module.exports.desc = 'Invites user to the given channel, or lists them.'
module.exports.handler = joinPrivate

function joinPrivate (argv) {
  console.log('got a private channel join req:', argv.command, argv.text)
  argv.respond(Team.get(argv.team_id).then(team => {
    const token = team.bot.bot_access_token
    return Group.get(team).then(chans => {
      if (!argv.channel) {
        return {
          text: 'A channel is required. Use `/list-private` to see a list of available private channels.'
        }
      }
      const channelName = argv.channel.replace(/^\#/, '')
      const channel = chans.find(g => g.name === channelName)
      if (!channel) {
        return {
          text: `#${channelName} is not available through this command. Use \`/list-private\` to see a list of available channels.`
        }
      }
      const cocTxt = process.env.COC_URL ? `<${process.env.COC_URL}|Code of Conduct>` : 'Code of Conduct'
      return chat.postMessageAsync({
        token,
        channel: channel.id,
        text: `Invite request from <@${argv.user_id}>! Use \`/invite @${argv.user_name}\` to accept (anyone here can do this)!`
      }).then(() => ({
        text: `Join request sent. Please wait while the request is processed.\n\nRemember that private channels are not for allies unless otherwise specified and that there is a strong expectation of privacy in these channels -- what is said in there stays there.\n\nThe ${cocTxt} still fully applies in these spaces, with some channel-specific caveats (discussion of sexuality in lgbtq channels, for example).`
      }))
    })
  }))
}
