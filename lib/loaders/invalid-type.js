module.exports = function loadInvalidType (node, cb) {
  cb(new Error('Invalid type: ' + node.type), {})
}
