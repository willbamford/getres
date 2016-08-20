var loadHttp = require('./http')

module.exports = function loadJson (entry, cb) {
  loadHttp(entry, function (err, resource) {
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
