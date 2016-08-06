"use strict"

module.exports = function (req, res, next) {
  if (req.body.token !== process.env.VERIFICATION_TOKEN) {
    res.send(500, {error: 'invalid verification token'})
    return next()
  }

  let handler
  try {
    handler = require('./events/' + req.body.event.type)
  } catch (e) {
    console.error('No handler for event type: ', req.body.event.type)
    res.send(500, {error: 'no such event handler'})
    return next()
  }

  handler(req.body, function (err, data) {
    if (err) {
      console.error('Unexpected handler error: ', err)
      res.send(500, {error: err.message})
    } else {
      res.send(200, data)
    }
    return next()
  })
}
