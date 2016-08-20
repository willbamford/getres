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
      parser: manifest[name].parser || function (resource) { return resource }
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
  image: loadImage
}

function load (entry, cb) {
  var loader = loaders[entry.type] || loadInvalidType
  loader(entry, function (err, resource) {
    try {
      entry.resource = entry.parser(resource)
    } catch (e) {
      return cb(e)
    }
    return cb(err)
  })
}

var getres = function (manifest, cb) {
  var entries = createEntries(manifest)
  var remaining = entries.length
  var err = null

  function done () {
    cb(null, extract(entries))
  }

  entries.map(function (entry) {
    load(entry, function (e) {
      if (e) {
        err = e
        cb(e, {})
      }
      remaining -= 1
      if (!remaining && !err) {
        done(entries)
      }
    })
  })
}

module.exports = getres
