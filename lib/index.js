var processManifest = require('./process-manifest')

function getresCallback (manifest, callback, progress) {
  var results = processManifest(manifest)
  var jobs = results.jobs
  var resources = results.resources
  jobs.process(
    function (err) {
      callback(err, resources)
    },
    progress
  )
}

function getresPromises (manifest, callback, progress) {
  var PromiseImpl = getres.Promise || (typeof Promise !== 'undefined' ? Promise : null)
  if (PromiseImpl) {
    return new PromiseImpl(function (resolve, reject) {
      getresCallback(
        manifest,
        function (err, res) {
          if (err) {
            return reject(err)
          }
          return resolve(res)
        },
        progress
      )
    })
  } else {
    throw new Error('Promises are not supported in this environment')
  }
}

function getres (manifest, callback, progress) {
  var fn = callback ? getresCallback : getresPromises
  return fn(manifest, callback, progress)
}

module.exports = getres
