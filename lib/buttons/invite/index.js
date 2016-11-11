'use strict'

const slack = require('slack')
const bluebird = require('bluebird')
const chat = bluebird.promisifyAll(slack.chat)
const Team = require('../../models/team')
const qs = require('querystring')
const fetch = require('node-fetch')

const signupMessage = require('./signup-message')

const CALLBACK_ID = 'invite'

module.exports.prompt = (team, channel, user) => (
  chat.postMessage(
    signupMessage(
      CALLBACK_ID, team.bot.bot_access_token, channel, user
    )
  )
)

module.exports.handler = (data) => {
  // console.log('got a user invite button press!', data.)

  return Team.get(data.team.id).then(team => {
    const token = team.invite_token
    if (!token) {
      return {
        token: team.access_token,
        replace_original: false,
        text: `:warning: No invite token for that team. :warning: <${process.env.APP_URL}/install-inviter?team=${team.team_id}|Authenticate the inviter.>`
      }
    }
    if (!data.actions[0].value) {
      return updateInviteButton(token, data, {
        title: 'Signup Rejected',
        color: '#CD2626',
        text: `:no_good::skin-tone-5: Rejected by <@${data.user.id}>`
      })
    }

    const email = data.actions[0].value
    return invite(
      token,
      team.domain,
      email
    ).then(rawResp =>
      rawResp.json()
    ).then(resp => {
      if (!resp.ok &&
        (resp.error === 'already_invited' ||
        resp.error === 'already_in_team')) {
        return updateInviteButton(token, data, {
          title: 'Already Invited',
          color: '#FFFF00',
          text: `:information_desk_person::skin-tone-5: This person has already been invited! <https://${team.domain}.slack.com/admin/invites|Manage invites.>`
        })
      } else if (!resp.ok && resp.error === 'user_disabled') {
        return updateInviteButton(token, data, {
          title: 'Disabled Account',
          color: '#CD2626',
          text: ':thinking_face: User account was previously disabled.'
        })
      } else if (!resp.ok) {
        return updateInviteButton(token, data, {
          title: 'Error while inviting',
          color: '#CD2626',
          text: `:astonished: Received unknown \`${resp.error}\` error while attempting to invite.`
        })
      } else {
        return updateInviteButton(token, data, {
          title: 'Invite Sent!',
          color: '#AADD00',
          text: `:ok_woman::skin-tone-5: Invited by <@${data.user.id}> :dancers: :tada:`
        })
      }
    })
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

function updateInviteButton (token, data, newMessage) {
  return {
    token: token,
    channel: data.channel.id,
    ts: data.message_ts,
    text: data.original_message.text,
    attachments: [
      data.original_message.attachments[0],
      data.original_message.attachments[1],
      newMessage
    ]
  }
}
