# Wheelie

Wheelie is a [Slack App](http://slack.com/apps) originally written for
[WeAllJS](http://wealljs.org). It takes care of various bits that a given slack
might need, such as an `/admin` command, a signup request handler with request
review, slack statistics, and channel management.

## Getting up and running

Wheelie is a heroku app, so get that set up.

Also, add the redis addon: `heroku addons:create rediscloud:30`

### Config

Go to the various pages in the Slack App configuration section, and set up
Wheelie with the following:

#### Basic Information

In the Basic Information section of your slack app, get (and set in the
environment) `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` and `VERIFICATION_TOKEN`
from the corresponding fields. That is, `heroku config:set
SLACK_CLIENT_ID=...client id...`

Then, run `heroku config:set APP_URL=https://<appname>.herokuapp.com`

#### OAuth and Permissions

Next, you should add the app's redirect uri to the redirect field on that page.
The URI is: https://<appname>.herokuapp.com/oauth

#### Bot Users

Pick a valid name for your bot. Anything is fine.

#### Interactive Messages

Next, go to Interactive Messages and set https://<appname>.herokuapp.com/button
as the Request URL.

#### Slack Commands

In the Slack Commands section, set up all the Wheelie commands as follows, using
https://<appname>.herokuapp.com/command as the Request URL for all of them (the
same endpoint is shared across all commands).

* `/admin <message for admins>  Notifies the admin channel.`
* `/help? <nothing> Displays bot help.`
* `/join-private <channel> Join a private channel.`
* `/list-private [filter] List private channels.`

### Other setup steps

#### Channels

Create two private channels: `#admin` and `#admin-signups` and invite your bot
into both of those. `#admin` is where `/admin` commands will go.
`#admin-signups` is where web signups requests will go.

#### Dedicated Invite User

* Create a new slack user with the name and email you want Slack invites to be
  sent with (for example, `MyCommunity Inviter <inviter@mycommunity.org`).
* Grant the user admin privileges
* Log in with the user on your browser (by visiting <yourslack>.slack.com)
* Visit https://<appname>.herokuapp.com/install-inviter?team=<team_id> -- the URL will be displayed the first time you try to accept a user anyway.

### Welcome message to new users

The `WELCOME_MESSAGE_TEXT` config var controls what message is sent to the new users when they join. By default it says:
`Welcome! Review the ${cocTxt} before participating in the community.`

To disable the welcome message, set the config var `SEND_WELCOME_MESSAGE` to `FALSE`.

