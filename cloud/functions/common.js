const ping = (request) => ({
  msg: 'pong',
  time: new Date()
})

module.exports = {
  ping,
}