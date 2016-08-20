module.exports = function loadImage (entry, cb) {
  var image = new window.Image()
  image.onload = function () {
    cb(null, image)
  }
  image.onerror = function (err) {
    cb(err)
  }
  image.src = entry.src
}
