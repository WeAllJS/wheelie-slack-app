'use strict'

module.exports = path => server => server.post(path, event)

function event (req, res, next) {
  // console.log('got an event', req.body)
  if (req.body.token !== process.env.VERIFICATION_TOKEN) {
    res.send(500, {error: 'invalid verification token'})
    return next()
  }

  const ev = req.body.event || req.body
  let handler
  try {
    handler = require('../events/' + ev.type)
  } catch (e) {
    console.error('No handler for event type: ', ev.type)
    res.send(500, {error: 'no such event handler'})
    return next()
  }

  handler(req.body, (err, data) => {
    if (err) {
      console.error('Unexpected handler error: ', err)
      res.send(500, {error: err.message})
    } else {
      res.send(200, data)
    }
    return next()
  })
}
