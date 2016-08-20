var loadHttp = require('./loaders/http')
var loadImage = require('./loaders/image')
var loadJson = require('./loaders/json')
var loadInvalidType = require('./loaders/invalid-type')

function createEntries (manifest) {
  return Object.keys(manifest).map(function (name) {
    return {
      name: name,
      src: manifest[name].src,
      type: manifest[name].type || 'text',
      parser: manifest[name].parser || function (resource, cb) { return cb(null, resource) }
    }
  })
}

function extract (entries) {
  var res = {}
  entries.forEach(function (entry) {
    res[entry.name] = entry.resource
  })
  return res
}

var loaders = {
  json: loadJson,
  text: loadHttp,
  image: loadImage,
  invalidType: loadInvalidType
}

function load (entry, cb) {
  var loader = loaders[entry.type] || loaders.invalidType
  loader(entry, function (err, resource) {
    if (err) {
      return cb(err)
    }
    entry.parser(resource, function (err, resource) {
      if (err) {
        return cb(err)
      }
      entry.resource = resource
      return cb(null)
    })
  })
}

function getresCallback (manifest, cb) {
  var entries = createEntries(manifest)
  var remaining = entries.length
  var err = null

  function error (err) {
    cb(err, {})
  }

  function done () {
    cb(null, extract(entries))
  }

  entries.map(function (entry) {
    load(entry, function (e) {
      remaining -= 1
      if (e) {
        err = e
        return error(e)
      }
      if (!remaining && !err) {
        done(entries)
      }
    })
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
