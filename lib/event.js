"use strict"

module.exports = function (req, res, next) {
  console.log('got an event: ', req.body)
  let handler
  try {
    handler = require('./events/' + req.body.event.type)
  } catch (e) {
    console.error('No handler for event type: ', req.body.event.type)
    res.send(500, {error: 'no such event handler'})
    return next()
  }

  handler(req.body.event, function (err) {
    if (err) {
      console.error('Unexpected handler error: ', err)
      res.send(500, {error: err.message})
    } else {
      res.send(200, {challenge: req.body.challenge})
    }
    return next()
  })
}
