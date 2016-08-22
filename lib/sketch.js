function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

function isObject (o) {
  return (typeof o === 'object') && (o !== null)
}

function isString (o) {
  return (typeof o === 'string') || (o instanceof String)
}

var srcData = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
}

var manifest = {
  alpha: {
    src: 'one'
  },
  beta: {
    src: ['two', 'three', 'four'],
    type: 'image'
  },
  cubemap: {
    front: {
      src: 'six'
    },
    left: {
      src: ['seven', 'eight'],
      type: 'json'
    },
    side: {
      delta: {
        src: 'five'
      }
    }
  },
  cubemap2: {
    src: {
      front: 'one',
      left: 'two',
      right: 'three'
    }
  },
  delta: {
    src: ['five']
  }
}

function enqueue (queue, src, node, cb) {
  console.log('Get src: ' + src + ', type: ' + node.type)
  var job = {
    src: src,
    node: node
  }
  queue.push(job)
  setTimeout(function () {
    var n = queue.indexOf(job)
    if (n !== -1) {
      queue.splice(n, 1)
    }
    cb(null, srcData[src])
  }, Math.random() * 10)
}

function processNode (node, name, queue, tree, cb) {
  if (!isObject(node)) {
    return cb(new Error('Invalid node'))
  } else if (node.src) {
    if (isString(node.src)) {
      enqueue(queue, node.src, node, function (err, resource) {
        tree[name] = resource
        cb(err, resource)
      })
    } else if (isArray(node.src)) {
      tree[name] = []
      node.src.forEach(function (src) {
        enqueue(queue, src, node, function (err, resource) {
          tree[name].push(resource)
          cb(err, resource)
        })
      })
    } else if (isObject(node.src)) {
      tree[name] = {}
      Object.keys(node.src).forEach(function (childName) {
        enqueue(queue, node.src[childName], node, function (err, resource) {
          tree[name][childName] = resource
          cb(err, resource)
        })
      })
    }
  } else {
    var subtree = tree
    if (name) {
      tree[name] = {}
      subtree = tree[name]
    }
    Object.keys(node).forEach(function (childName) {
      processNode(node[childName], childName, queue, subtree, cb)
    })
  }
}

function run (manifest, cb) {
  var res = {}
  var name = null
  var queue = []
  var runError
  processNode(manifest, name, queue, res, function (err, resource) {
    if (err) {
      runError = err
      // TODO: abort queue
      console.error(err)
      return
    }

    console.log('r', resource)
    console.log(queue.length)

    if (!queue.length && !runError) {
      console.log('Done')
      console.log(res)
    }
  })
}

run(manifest, function (err, res) {
  console.log('err', err)
  console.log('res', res)
})
