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
        text: `No invite token for that team. Visit ${process.env.APP_URL}/install-inviter?team=${team.team_id} to authenticate an inviter.`
      }
    }
    if (!data.actions[0].value) {
      return updateInviteButton(token, data, {
        title: 'Signup Rejected',
        color: '#CD2626',
        text: `Rejected by <@${data.user.id}>`
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
          text: 'This person has already been invited!'
        })
      } else if (!resp.ok) {
        throw resp
      } else {
        return updateInviteButton(token, data, {
          title: 'Invite Sent!',
          color: '#AADD00',
          text: `:white_check_mark: Invited by <@${data.user.id}> :tada:`
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
