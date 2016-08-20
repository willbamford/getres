var processHttp = require('./http')

module.exports = function processJson (entry, cb) {
  processHttp(entry, function (err, resource) {
    if (err) {
      return cb(err)
    }
    try {
      return cb(err, JSON.parse(resource))
    } catch (e) {
      return cb(e)
    }
  })
}
