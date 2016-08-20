module.exports = function processInvalidType (entry, cb) {
  cb(new Error('Invalid manifest type: ' + entry.type), {})
}
