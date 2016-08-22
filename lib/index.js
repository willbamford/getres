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

var identityParser = function (resource, cb) {
  return cb(null, resource)
}

function enqueue (queue, src, node, cb) {
  node = node || {}
  var job = {
    src: src,
    type: node.type || 'text',
    parser: node.parser || identityParser
  }
  queue.push(job)
  var loader = loaders[job.type] || loaders.invalidType
  loader(job, function (err, resource) {
    if (err) {
      return cb(err)
    }
    job.parser(resource, function (err, resource) {
      var n = queue.indexOf(job)
      if (n !== -1) {
        queue.splice(n, 1)
      }
      if (err) {
        return cb(err)
      }
      return cb(null, resource)
    })
  })
}

function processNode (node, name, queue, tree, cb) {
  if (!isObject(node)) {
    return cb(new Error('Invalid node'))
  } else if (node.src) {
    if (isString(node.src)) {
      enqueue(queue, node.src, node, function (err, resource) {
        tree[name] = resource
        cb(err, resource)
      })
    } else if (isArray(node.src)) {
      tree[name] = []
      node.src.forEach(function (src) {
        enqueue(queue, src, node, function (err, resource) {
          tree[name].push(resource)
          cb(err, resource)
        })
      })
    } else if (isObject(node.src)) {
      tree[name] = {}
      Object.keys(node.src).forEach(function (childName) {
        enqueue(queue, node.src[childName], node, function (err, resource) {
          tree[name][childName] = resource
          cb(err, resource)
        })
      })
    }
  } else {
    var subtree = tree
    if (name) {
      tree[name] = {}
      subtree = tree[name]
    }
    Object.keys(node).forEach(function (childName) {
      processNode(node[childName], childName, queue, subtree, cb)
    })
  }
}

function getresCallback (manifest, cb) {
  var res = {}
  var name = null
  var queue = []
  var runError

  function error (err) {
    cb(err, {})
  }

  function done (res) {
    cb(null, res)
  }

  processNode(manifest, name, queue, res, function (err, resource) {
    if (err) {
      runError = err
      error(err)
    }

    if (!queue.length && !runError) {
      done(res)
    }
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
