function identityParser (resource) {
  return resource
}

function createJob (src, node, loaders) {
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
    setTimeout(function () {
      listeners.forEach(function (cb) {
        cb(err, resource, job)
      })
    }, 0)
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
