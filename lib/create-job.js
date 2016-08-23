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

function createJob (src, node, notifyDone) {
  node = node || {}
  var type = node.type || 'text'
  var parser = node.parser || identityParser

  var job = {
    src: src,
    type: type,
    process: process
  }

  function process (cb) {
    var loader = loaders[job.type] || loaders.invalidType
    loader(job, function (err, resource) {
      if (err) {
        return cb(err, job)
      }
      parser(resource, function (err, resource) {
        if (err) {
          return cb(err, job)
        }
        notifyDone(resource)
        cb(null, job)
      })
    })
  }

  return job
}

module.exports = createJob
