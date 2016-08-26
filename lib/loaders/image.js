var loadHttp = require('./http')
var lwip = require('lwip')
var createRgba = require('../utils/create-rgba')
var getExt = require('../utils/get-ext')

module.exports = function loadImage (node, cb) {
  loadHttp(node, function (err, resource) {
    if (err) {
      return cb(err)
    }
    lwip.open(resource, getExt(node.src), function (err, image) {
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
