module.exports = function loadInvalidType (entry, cb) {
  cb(new Error('Invalid manifest type: ' + entry.type), {})
}
