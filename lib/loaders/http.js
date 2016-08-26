var request = require('superagent')

module.exports = function loadHttp (node, cb) {
  var req = request.get(node.src)

  if (node.credentials) {
    req.withCredentials()
  }

  req.end(function (err, response) {
    cb(err, response ? response.body : null)
  })
}
