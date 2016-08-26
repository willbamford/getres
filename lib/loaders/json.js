var loadHttp = require('./http')

module.exports = function loadJson (node, cb) {
  loadHttp(node, function (err, resource) {
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
