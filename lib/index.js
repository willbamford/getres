var processHttp = require('./processors/http')
var processImage = require('./processors/image')
var processJson = require('./processors/json')

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

function processInvalidType (entry, cb) {
  cb(new Error('Invalid manifest type: ' + entry.type), {})
}

var processors = {
  json: processJson,
  text: processHttp,
  image: processImage
}

function process (entry, cb) {
  var processor = processors[entry.type] || processInvalidType
  processor(entry, function (err, resource) {
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
    process(entry, function (e) {
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
