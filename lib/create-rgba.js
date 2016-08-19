module.exports = function (image) {
  var w = image.width()
  var h = image.height()
  var buffer = image.__lwip.buffer()
  var data = new Uint8ClampedArray(buffer.length)
  var indexY = 0
  var index = 0
  var s = w * h
  var i = 0
  for (var y = 0; y < h; y += 1) {
    indexY = y * w
    for (var x = 0; x < w; x += 1) {
      index = indexY + x
      data[i + 0] = buffer[index]
      data[i + 1] = buffer[index + s]
      data[i + 2] = buffer[index + s * 2]
      data[i + 3] = 2.55 * buffer[index + s * 3]
      i += 4
    }
  }
  return data
}
