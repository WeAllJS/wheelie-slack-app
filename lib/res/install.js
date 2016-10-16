'use strict'

module.exports = (path, scopes) => server => server.get(path, install(scopes))

function install (scopes) {
  return (req, res, next) => {
    const body = `<a href="https://slack.com/oauth/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopes}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'text/html'
    })
    res.write(body)
    res.end()
    next()
  }
}
