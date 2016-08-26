module.exports = function loadInvalidType (node, cb) {
  cb(new Error('Invalid manifest type: ' + node.type), {})
}
