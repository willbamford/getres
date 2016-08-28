module.exports = function loadImage (node, cb) {
  var image = new window.Image()
  image.onload = function () {
    cb(null, image)
  }
  image.onerror = function (err) {
    cb(err)
  }
  image.crossOrigin = node.credentials
    ? 'use-credentials'
    : 'anonymous'
  image.src = node.src
}
