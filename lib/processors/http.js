var request = require('superagent')

module.exports = function processHttp (entry, cb) {
  request
    .get(entry.src)
    .end(function (err, response) {
      cb(err, response ? response.body : null)
    })
}
