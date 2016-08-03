module.exports = function (req, res, next) {
  console.log('got an event: ', req.body)
  res.send(200, {challenge: req.body.challenge})
  next()
}
