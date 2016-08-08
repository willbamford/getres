var superagent = require('superagent')

console.log(superagent)

var noop = function () {}

var ual = function (manifest, onError, onComplete, onProgress) {
  onError = onError || noop
  onComplete = onComplete || noop
  onProgress = onProgress || noop
}

module.exports = ual
