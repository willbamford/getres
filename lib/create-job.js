var identityParser = function (resource, cb) {
  return cb(null, resource)
}

function createJob (src, node, onDone) {
  node = node || {}
  return {
    src: src,
    type: node.type || 'text',
    parser: node.parser || identityParser,
    onDone: onDone
  }
}

module.exports = createJob
