var loadHttp = require('./http')
var lwip = require('lwip')
var createRgba = require('./create-rgba')
var getExt = require('./get-ext')

module.exports = function loadImage (entry, cb) {
  loadHttp(entry, function (err, resource) {
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