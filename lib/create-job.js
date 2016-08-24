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

function identityParser (resource, cb) {
  return cb(null, resource)
}

function createJob (src, node) {
  node = node || {}
  var type = node.type || 'text'
  var parser = node.parser || identityParser
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

  var job = {
    src: src,
    type: type,
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
      parser(resource, function (err, resource) {
        notify(err, resource, job)
      })
    })
  }

  return job
}

module.exports = createJob
