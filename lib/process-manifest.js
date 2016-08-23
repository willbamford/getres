var createJobs = require('./create-jobs')

function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

function isObject (o) {
  return (typeof o === 'object') && (o !== null)
}

function isString (o) {
  return (typeof o === 'string') || (o instanceof String)
}

function processNode (node, name, jobs, resources) {
  name = name || null
  var isRoot = !name

  if (!isObject(node)) {
    throw new Error('Invalid node')
  } else if (node.src) {
    if (isString(node.src)) {
      jobs.enqueue(node.src, node, function (resource) {
        resources[name] = resource
      })
    } else if (isArray(node.src)) {
      resources[name] = []
      node.src.forEach(function (src) {
        jobs.enqueue(src, node, function (resource) {
          resources[name].push(resource)
        })
      })
    } else if (isObject(node.src)) {
      resources[name] = {}
      Object.keys(node.src).forEach(function (childName) {
        jobs.enqueue(node.src[childName], node, function (resource) {
          resources[name][childName] = resource
        })
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

function processManifest (manifest) {
  var jobs = createJobs()
  var resources = {}
  processNode(manifest, null, jobs, resources)
  return {
    jobs: jobs,
    resources: resources
  }
}

module.exports = processManifest
