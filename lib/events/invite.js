const storage = require('../util/storage')
const qs = require('querystring')
const fetch = require('node-fetch')

module.exports = (data, cb) => {
  console.log('got a user invite button press!', data)

  const client = storage()
  return client.hgetAsync('teams', data.team.id).then(json => {
    const team = JSON.parse(json)
    const token = team.invite_token
    if (!token) {
      return {
        token: team.access_token,
        replace_original: false,
        text: `No invite token for that team. Visit ${process.env.APP_URL}/install-inviter?team=${team.team_id} to authenticate an inviter.`
      }
    }
    if (!data.actions[0].value) {
      return {
        token: token,
        channel: data.channel.id,
        ts: data.message_ts,
        text: data.original_message.text,
        attachments: [
          data.original_message.attachments[0],
          data.original_message.attachments[1],
          {
            title: 'Signup Rejected',
            color: '#CD2626',
            text: `Rejected by <@${data.user.id}>`
          }
        ]
      }
    }

    const email = data.actions[0].value
    return invite(
      token,
      team.domain,
      email
    ).then(resp => (
      client.hdelAsync(
        `signups-${data.team.id}`, email
      ).then(() => {
        client.quit()
        // pass it on!
        return resp.json()
      })
    )).then(resp => {
      if (!resp.ok &&
        (resp.error === 'already_invited' ||
        resp.error === 'already_in_team')) {
        return {
          token: token,
          channel: data.channel.id,
          ts: data.message_ts,
          text: data.original_message.text,
          attachments: [
            data.original_message.attachments[0],
            data.original_message.attachments[1],
            {
              title: 'Already Invited',
              color: '#FFFF00',
              text: 'This person has already been invited!'
            }
          ]
        }
      } else if (!resp.ok) {
        throw resp
      } else {
        return {
          token: token,
          channel: data.channel.id,
          ts: data.message_ts,
          text: data.original_message.text,
          attachments: [
            data.original_message.attachments[0],
            data.original_message.attachments[1],
            {
              title: 'Invite Sent!',
              color: '#AADD00',
              text: `:white_check_mark: Invited by <@${data.user.id}> :tada:`
            }
          ]
        }
      }
    })
  }).then(newMsg => (
    cb(null, newMsg)
  )).catch(e => {
    console.error('err: ', e)
    cb(e)
  })
}

function invite (token, team_domain, email) {
  const uri = `https://${team_domain}.slack.com/api/users.admin.invite`
  return fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      email,
      token,
      set_active: true
    })
  })
}
