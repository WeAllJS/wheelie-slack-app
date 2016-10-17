const Team = require('../models/team')
const slack = require('slack')
const bluebird = require('bluebird')
const groups = bluebird.promisifyAll(slack.groups)
const chat = bluebird.promisifyAll(slack.chat)

module.exports.command = 'join-private [channel]'
module.exports.desc = 'Invites user to the given channel, or lists them.'
module.exports.handler = joinPrivate

function joinPrivate (argv) {
  console.log('got a private channel join req:', argv.command, argv.text)
  argv.respond(Team.get(argv.team_id).then(team => {
    const token = team.bot.bot_access_token
    return groups.listAsync({
      token,
      exclude_archived: 1
    }).then(res => (
      res.groups.filter(g => (
        !g.name.match(/^admin/i) && !g.purpose.value.match(/\[secret\]/gi)
      ))
    )).then(chans => {
      if (!argv.channel) {
        return displayGroupList('Pick a channel to join.', chans)
      }
      const channelName = argv.channel.replace(/^\#/, '')
      const channel = chans.find(g => g.name === channelName)
      console.log('channel: ', channelName, channel, chans)
      if (!channel) {
        return displayGroupList(`#${channelName} is not available.`, chans)
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

function formatChannel (chan) {
  return `#${chan.name}${chan.purpose.value ? ' - ' + chan.purpose.value : ''}`
}
function displayGroupList (msg, groups) {
  const str = groups.reduce((acc, group) => (
    `${acc}  ~ ${formatChannel(group)}\n`
  ), '')
  return {
    text: `${msg ? msg + '\n\n' : ''}Use \`/join-private #<channelname>\` to join.\n\nAvailable private channels:\n\n${str}`
  }
}
