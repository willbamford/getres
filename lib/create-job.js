var loadHttp = require('./loaders/http')
var loadImage = require('./loaders/image')
var loadJson = require('./loaders/json')
var loadInvalidType = require('./loaders/invalid-type')

var loaders = {
  json: loadJson,
  text: loadHttp,
  image: loadImage,
  invalidType: loadInvalidType
}

function identityParser (resource) {
  return resource
}

function createJob (src, node) {
  node = node || {}
  var type = node.type || 'text'
  var parser = node.parser || identityParser
  var credentials = node.credentials || false
  var listeners = []

  function listen (cb) {
    if (cb && listeners.indexOf(cb) === -1) {
      listeners.push(cb)
    }
    return job
  }

  function notify (err, resource, job) {
    listeners.forEach(function (cb) {
      cb(err, resource, job)
    })
    return job
  }

  function parseAndNotify (resource) {
    try {
      var syncResource = parser(resource, function (err, asyncResource) {
        notify(err, asyncResource, job)
      })
      if (typeof syncResource !== 'undefined') {
        notify(null, syncResource, job)
      }
    } catch (err) {
      notify(err, null, job)
    }
  }

  var job = {
    src: src,
    type: type,
    credentials: credentials,
    process: process,
    listen: listen
  }

  listen(node.cb)

  function process () {
    var loader = loaders[job.type] || loaders.invalidType
    loader(job, function (err, resource) {
      if (err) {
        return notify(err, resource, job)
      }

      parseAndNotify(resource)
    })
  }

  return job
}

module.exports = createJob
