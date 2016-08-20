var request = require('superagent')
var lwip = require('lwip')
var createRgba = require('./create-rgba')
var getExt = require('./get-ext')

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

function processHttp (entry, cb) {
  request
    .get(entry.src)
    .end(function (err, response) {
      cb(err, response ? response.body : null)
    })
}

function processJson (entry, cb) {
  processHttp(entry, function (err, resource) {
    if (err) {
      return cb(err)
    }
    try {
      return cb(err, JSON.parse(resource))
    } catch (e) {
      return cb(e)
    }
  })
}

function processImage (entry, cb) {
  processHttp(entry, function (err, resource) {
    if (err) {
      return cb(err)
    }
    lwip.open(resource, getExt(entry.src), function (err, image) {
      if (err) {
        return cb(err)
      }
      cb(null, {
        width: image.width(),
        height: image.height(),
        data: createRgba(image)
      })
    })
  })
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
