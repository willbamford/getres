var request = require('superagent')

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

function process (entry, cb) {
  switch (entry.type) {
    case 'json':
      return processHttp(entry, function (err, resource) {
        cb(err, JSON.parse(resource))
      })
    case 'text':
      return processHttp(entry, cb)
    default:
      cb(new Error('Invalid manifest type: ' + entry.type))
  }
}

var getres = function (manifest, cb) {
  var entries = createEntries(manifest)
  var remaining = entries.length
  var err = null

  function done () {
    cb(null, extract(entries))
  }

  entries.map(function (entry) {
    process(entry, function (e, resource) {
      if (e) {
        err = e
        cb(e)
      } else {
        entry.resource = entry.parser(resource)
      }
      remaining -= 1
      if (!remaining && !err) {
        done(entries)
      }
    })
  })
}

module.exports = getres
