module.exports = function (src) {
  // http://stackoverflow.com/a/1203361/186965
  return src.substr((~-src.lastIndexOf('.') >>> 0) + 2)
}
