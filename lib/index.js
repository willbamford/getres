var processConfig = require('./process-config')

var loadHttp = require('./loaders/http')
var loadJson = require('./loaders/json')
var loadInvalidType = require('./loaders/invalid-type')

var loaders = {
  json: loadJson,
  text: loadHttp,
  invalidType: loadInvalidType
}

function getresCallback (config, callback, progress) {
  try {
    var results = processConfig(config, loaders)
    var jobs = results.jobs
    var resources = results.resources
    jobs.process(
      function (err) {
        callback(err, resources)
      },
      progress
    )
  } catch (err) {
    callback(err)
  }
}

function getresPromises (config, callback, progress) {
  var PromiseImpl = typeof getres.Promise !== 'undefined'
    ? getres.Promise
    : (typeof Promise !== 'undefined' ? Promise : null)
  if (PromiseImpl) {
    return new PromiseImpl(function (resolve, reject) {
      getresCallback(
        config,
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

function getres (config, callback, progress) {
  var fn = callback ? getresCallback : getresPromises
  return fn(config, callback, progress)
}

getres.register = function (type, loader) {
  loaders[type] = loader
  return this
}

module.exports = getres
