var processManifest = require('./process-manifest')

function getresCallback (manifest, cb) {
  var results = processManifest(manifest)
  var jobs = results.jobs
  var resources = results.resources
  jobs.process(function (err) {
    cb(err, resources)
  })
}

function getresPromises (manifest, cb) {
  if (typeof Promise !== 'undefined') {
    return new Promise(function (resolve, reject) {
      getresCallback(manifest, function (err, res) {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  } else {
    throw new Error('Promises are not supported in this environment')
  }
}

function getres (manifest, cb) {
  var fn = cb ? getresCallback : getresPromises
  return fn(manifest, cb)
}

module.exports = getres
