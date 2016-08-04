const redis = require('redis')
const bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = function () {
  return redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})
}
