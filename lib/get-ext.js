// http://stackoverflow.com/a/1203361/186965
module.exports = function (src) {
  return src.substr((~-src.lastIndexOf('.') >>> 0) + 2)
}
