'use strict'

const qs = require('querystring')

module.exports = path => server => server.post(path, button)

function button (req, res, next) {
  const params = JSON.parse(qs.parse(req.body).payload)
  if (params.token !== process.env.VERIFICATION_TOKEN) {
    console.error('bad token in request')
    res.send(500, {error: 'invalid verification token'})
    return next()
  }

  let handler
  try {
    handler = require('../buttons/' + params.callback_id.trim()).handler
  } catch (e) {
    console.error('No handler for button callback: ', params.callback_id)
    console.error(e)
    res.send(500, {error: 'no such event handler'})
    return next()
  }

  handler(params).then(data => (
    res.send(200, data)
  ).catch(err => {
    console.error('Unexpected handler error: ', err)
    res.send(500, {error: err.message})
  }).finally(() => next()))
}
