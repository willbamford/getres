var request = require('superagent')

module.exports = function loadHttp (entry, cb) {
  request
    .get(entry.src)
    .end(function (err, response) {
      cb(err, response ? response.body : null)
    })
}
