const storage = require('../util/storage')
const Promise = require('bluebird')

module.exports.get = (teamId) => {
  const client = storage()
  return client.hgetAsync('team', teamId).then(json => {
    if (!json) {
      throw new Error('team not found: ' + teamId)
    } else {
      return JSON.parse(json)
    }
  }).always(() => client.quit())
}

module.exports.set = (teamId, newTeam) => {
  const client = storage()
  return client.hsetAsync(
    'team', teamId, JSON.stringify(newTeam)
  ).always(() => client.quit())
}

module.exports.getAll = () => {
  const client = storage()
  Promise((resolve, reject) => (
    client.hgetall((err, teams) => err ? reject(err) : resolve(teams || []))
  )).catch(
    err => console.error('uhhh, error getting teams list: ', err)
  ).always(() => client.quit())
}
