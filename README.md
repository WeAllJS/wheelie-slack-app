# Wheelie

Wheelie is a [Slack App](slack.com/apps) originally written for
[WeAllJS](wealljs.org). It takes care of various bits that a given slack might
need, such as an `/admin` command, a signup request handler with request review,
slack statistics, and channel management.

## Getting up and running

Wheelie is a heroku app, so get that set up.

Once you've got that set up, you'll need to visit the OAuth section of the apps
site and get (and set) `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` and
`VERIFICATION_TOKEN` from the corresponding fields.

Next, you should add the app's redirect uri to the redirect field on that page.
The URI is: https://<appname>.herokuapp.com/oauth

Next, add a Bot User with whatever name you want for it.

Next, go to Interactive Messages and set https://<appname>.herokuapp.com/button
as the Request URL

Next, go to Slash Commands and create a command called `/admin` that points to
https://<appname>.herokuapp.com/admin

Finally, add the Rediscloud addong: `heroku addons:create rediscloud:30 `
