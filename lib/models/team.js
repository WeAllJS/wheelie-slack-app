const storage = require('../util/storage')
const Promise = require('bluebird')

module.exports.get = (teamId) => {
  const client = storage()
  return client.hgetAsync('teams', teamId).then(json => {
    if (!json) {
      throw new Error('team not found: ' + teamId)
    } else {
      return JSON.parse(json)
    }
  }).finally(() => client.quit())
}

module.exports.set = (teamId, newTeam) => {
  const client = storage()
  return client.hsetAsync(
    'teams', teamId, JSON.stringify(newTeam)
  ).finally(() => client.quit())
}

module.exports.getAll = () => {
  const client = storage()
  return new Promise((resolve, reject) => (
    client.hgetall('teams', (err, teams) => (
      err ? reject(err) : resolve(teams)
    ))
  )).catch(
    err => console.error('uhhh, error getting teams list: ', err)
  ).finally(() => client.quit())
}
