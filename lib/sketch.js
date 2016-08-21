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

var queue = []

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
  delta: {
    src: ['five']
  }
}

/*
  res.alpha = 1
  res.beta = [2, 3, 4]
  res.gamma.twinsen = 6
  res.gamma.zoe = [7, 8]
  res.delta = 5
 */

function enqueue (src, node, cb) {
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

function processNode (node, name, tree, cb) {
  if (!isObject(node)) {
    return cb(new Error('Invalid node'))
  } else if (node.src) {
    if (isString(node.src)) {
      enqueue(node.src, node, function (err, resource) {
        if (err) {
          return cb(err)
        }
        tree[name] = resource
        if (!queue.length) {
          cb()
        }
      })
    } else if (isArray(node.src)) {
      tree[name] = []
      node.src.forEach(function (src) {
        enqueue(src, node, function (err, resource) {
          if (err) {
            return cb(err)
          }
          tree[name].push(resource)
          if (!queue.length) {
            cb()
          }
        })
      })
    } /* else error */
  } else {
    var subtree = tree
    if (name) {
      tree[name] = {}
      subtree = tree[name]
    }
    Object.keys(node).forEach(function (childName) {
      processNode(node[childName], childName, subtree, cb)
    })
  }
}

function run (manifest, cb) {
  var res = {}
  var name = null
  processNode(manifest, name, res, function (err) {
    if (err) {
      console.error(err)
      return
    }
    console.log('Done!')
    console.log(res)
  })
}

run(manifest, function (err, res) {
  console.log('err', err)
  console.log('res', res)
})
