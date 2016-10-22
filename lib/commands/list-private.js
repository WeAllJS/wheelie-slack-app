const Group = require('../models/group')

module.exports.command = 'list-private [filter]'
module.exports.desc = 'Lists all available private channels.'
module.exports.handler = listPrivate

function listPrivate (argv) {
  const filter = argv.filter ? new RegExp(argv.filter) : null
  argv.respond(Group.get(argv.team_id, filter).then(chans => ({
    text: displayGroupList(argv.filter, chans)
  })))
}

function formatChannel (chan) {
  const omitCount = chan.purpose.value && chan.purpose.value.match(/\[no\-count\]/g)
  const purpose = chan.purpose.value.replace(/\[[^\]]*\]/g, '')
  return `#${chan.name} [${omitCount ? '?' : chan.members.length - 1}]${purpose ? ' - ' + purpose : ''}`
}

function displayGroupList (filter, groups) {
  const str = groups.reduce((acc, group) => (
    // Subtracting 1 from `group.members.length` to exclude Wheelie.
    `${acc}  ~ ${formatChannel(group)}\n`
  ), '')
  return str
  ? `Available private channels:\n\n${str}\n\nUse \`/join-private <channelname>\` to join a channel.`
  : filter
  ? `No channels matching \`${filter}\`.`
  : `No private channels available`
}
