var createJob = require('./create-job')
var createJobs = require('./create-jobs')
var loadHttp = require('./loaders/http')
var loadImage = require('./loaders/image')
var loadJson = require('./loaders/json')
var loadInvalidType = require('./loaders/invalid-type')

function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

function isObject (o) {
  return (typeof o === 'object') && (o !== null)
}

function isString (o) {
  return (typeof o === 'string') || (o instanceof String)
}

var loaders = {
  json: loadJson,
  text: loadHttp,
  image: loadImage,
  invalidType: loadInvalidType
}

function processNode (node, name, jobs, resources) {
  name = name || null
  var isRoot = !name

  if (!isObject(node)) {
    throw new Error('Invalid node')
  } else if (node.src) {
    if (isString(node.src)) {
      jobs.add(createJob(node.src, node, function (resource) {
        resources[name] = resource
      }))
    } else if (isArray(node.src)) {
      resources[name] = []
      node.src.forEach(function (src) {
        jobs.add(createJob(src, node, function (resource) {
          resources[name].push(resource)
        }))
      })
    } else if (isObject(node.src)) {
      resources[name] = {}
      Object.keys(node.src).forEach(function (childName) {
        jobs.add(createJob(node.src[childName], node, function (resource) {
          resources[name][childName] = resource
        }))
      })
    }
  } else {
    var subtree = resources
    if (!isRoot) {
      resources[name] = {}
      subtree = resources[name]
    }
    Object.keys(node).forEach(function (childName) {
      processNode(node[childName], childName, jobs, subtree)
    })
  }
}

function processJobs (jobs, cb) {
  jobs.each(
    function processJob (job) {
      var loader = loaders[job.type] || loaders.invalidType
      loader(job, function (err, resource) {
        if (err) {
          return cb(err, job)
        }
        job.parser(resource, function (err, resource) {
          if (err) {
            return cb(err, job)
          }
          job.onDone(resource)
          cb(null, job)
        })
      })
    }
  )
}

function getresCallback (manifest, cb) {
  var runError
  var jobs = createJobs()
  var resources = {}
  processNode(manifest, null, jobs, resources)

  function onError (err) {
    cb(err, {})
  }

  function onDone () {
    cb(null, resources)
  }

  function onJobDone (err, job) {
    jobs.remove(job)
    if (err) {
      runError = new Error('Job error ' + job.src + '. ' + err.message)
      return onError(runError)
    }
    if (jobs.empty() && !runError) {
      return onDone()
    }
  }

  processJobs(jobs, onJobDone)
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
