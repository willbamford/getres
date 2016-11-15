const test = require('ava')
const proxyquire = require('proxyquire')
const images = require('./fixtures/images')

function mockSuperagent (reqs) {
  return {
    get: function (url) {
      this.url = url
      this._test.withCredentialsCalled[this.url] = false
      return this
    },
    withCredentials: function () {
      this._test.withCredentialsCalled[this.url] = true
      return this
    },
    end: function (cb) {
      const req = reqs[this.url]
      setTimeout(() => {
        if (req.err) {
          cb(req.err)
        } else {
          cb(null, { body: req.body })
        }
      }, 0)
    },
    _test: {
      withCredentialsCalled: {}
    }
  }
}

function beginsWith (needle, haystack) {
  return haystack.substr(0, needle.length) === needle
}

function createGetres (reqs) {
  const superagent = mockSuperagent(reqs)
  const httpLoader = proxyquire('../lib/loaders/http', { superagent })
  const getres = proxyquire('../lib', {
    './loaders/http': httpLoader,
    './loaders/image': proxyquire('../lib/loaders/image', {
      './http': httpLoader
    }),
    './loaders/json': proxyquire('../lib/loaders/json', {
      './http': httpLoader
    })
  })
  return {
    getres,
    superagent
  }
}

test.cb('get text', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt', type: 'text' }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.foo, 'Foo')
      t.is(res.bar, 'Bar')
      t.end()
    }
  )
})

test.cb('get array src', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      arr: { src: [ '/foo.txt', '/bar.txt' ] }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.arr[0], 'Foo')
      t.is(res.arr[1], 'Bar')
      t.end()
    }
  )
})

test.cb('get object src', (t) => {
  const { getres } = createGetres({
    '/a.txt': { body: 'A' },
    '/b.txt': { body: 'B' }
  })
  getres(
    {
      root: {
        src: {
          a: '/a.txt',
          b: '/b.txt'
        }
      }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.root.a, 'A')
      t.is(res.root.b, 'B')
      t.end()
    }
  )
})

test.cb('get nested', (t) => {
  const { getres } = createGetres({
    '/a.txt': { body: 'this is a' },
    '/b.txt': { body: 'this is b' }
  })
  getres(
    {
      a: {
        src: '/a.txt'
      },
      p: {
        b: {
          src: '/b.txt',
          type: 'text',
          parser: (resource, cb) => {
            cb(null, resource.toUpperCase())
          }
        }
      }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.a, 'this is a')
      t.is(res.p.b, 'THIS IS B')
      t.end()
    }
  )
})

test.cb('resource callback', (t) => {
  t.plan(6)
  const mockErr = new Error('Not Found')
  const { getres } = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: {
        src: '/foo.txt',
        cb: (err, resource) => {
          t.deepEqual(err, mockErr)
          t.is(resource, null)
        }
      },
      bar: {
        src: '/bar.txt',
        parser: (resource, cb) => { cb(null, resource.toUpperCase()) },
        cb: (err, resource) => {
          t.is(err, null)
          t.is('BAR', resource)
          t.end()
        }
      }
    },
    (err, res) => {
      t.is(err.message, 'Job error /foo.txt. Not Found')
      t.deepEqual(res, {})
    }
  )
})

test.cb('get json', (t) => {
  const { getres } = createGetres({
    '/zoe.json': { body: '{ "hello": "world!" }' }
  })
  getres(
    {
      zoe: { src: '/zoe.json', type: 'json' }
    },
    (err, res) => {
      t.is(err, null)
      t.deepEqual(res.zoe, { hello: 'world!' })
      t.end()
    }
  )
})

test.cb('handle json decode error', (t) => {
  const { getres } = createGetres({
    '/invalid.json': { body: '{ "hello: "world!" }' }
  })
  getres(
    {
      zoe: { src: '/invalid.json', type: 'json' }
    },
    (err, res) => {
      t.true(beginsWith('Job error /invalid.json.', err.message))
      t.end()
    }
  )
})

test.cb('get png image', (t) => {
  const { getres } = createGetres({
    '/img.png': { body: images.png.input }
  })
  getres(
    {
      img: { src: '/img.png', type: 'image' }
    },
    (err, res) => {
      t.is(err, null)
      t.deepEqual(res.img, images.png.expect)
      t.end()
    }
  )
})

test.cb('get gif image', (t) => {
  const { getres } = createGetres({
    '/img.gif': { body: images.gif.input }
  })
  getres(
    {
      img: { src: '/img.gif', type: 'image' }
    },
    (err, res) => {
      t.is(err, null)
      t.deepEqual(res.img, images.gif.expect)
      t.end()
    }
  )
})

test.cb('get jpg image', (t) => {
  const { getres } = createGetres({
    '/img1.jpg': { body: images.jpg.input },
    '/img2.jpeg': { body: images.jpg.input }
  })
  getres(
    {
      img1: { src: '/img1.jpg', type: 'image' },
      img2: { src: '/img2.jpeg', type: 'image' }
    },
    (err, res) => {
      t.is(err, null)
      t.deepEqual(res.img1, images.jpg.expect)
      t.deepEqual(res.img2, images.jpg.expect)
      t.end()
    }
  )
})

test.cb('handle corrupt png image error', (t) => {
  const { getres } = createGetres({
    '/corrupt.png': { body: images.corruptPng.input }
  })
  getres(
    {
      img: { src: '/corrupt.png', type: 'image' }
    },
    (err, res) => {
      t.is(err.message, 'Job error /corrupt.png. Invalid PNG buffer')
      t.end()
    }
  )
})

test.cb('handle type error', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt', type: 'invalid' }
    },
    (err, res) => {
      t.is(err.message, 'Job error /bar.txt. Invalid type: invalid')
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('handle http errors', (t) => {
  const mockErr = new Error('Not Found')
  const { getres } = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Foo' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    },
    (err, res) => {
      t.is(err.message, 'Job error /foo.txt. Not Found')
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('use async parser function', (t) => {
  const { getres } = createGetres({ '/world.txt': { body: 'hello world' } })
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: (resource, cb) => {
          setTimeout(() => {
            cb(null, resource.toUpperCase())
          }, 0)
        }
      }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.hello, 'HELLO WORLD')
      t.end()
    }
  )
})

test.cb('use sync parser function', (t) => {
  const { getres } = createGetres({ '/world.txt': { body: 'hello world' } })
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: (resource) => resource.toUpperCase()
      }
    },
    (err, res) => {
      t.is(err, null)
      t.is(res.hello, 'HELLO WORLD')
      t.end()
    }
  )
})

test.cb('handle async parser error', (t) => {
  const { getres } = createGetres({ '/world.txt': { body: 'hello world' } })
  const expectErr = new Error('Parse this!')
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: (resource, cb) => {
          cb(expectErr)
        }
      }
    },
    (err, res) => {
      t.is(err.message, 'Job error /world.txt. Parse this!')
      t.end()
    }
  )
})

test.cb('handle sync parser error', (t) => {
  const { getres } = createGetres({ '/world.txt': { body: 'hello world' } })
  const expectErr = new Error('Parse this!')
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: (resource) => {
          throw expectErr
        }
      }
    },
    (err, res) => {
      t.is(err.message, 'Job error /world.txt. Parse this!')
      t.end()
    }
  )
})

test('get text promise', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' }
  })
  return getres({ foo: { src: '/foo.txt' } })
    .then((res) => {
      t.is(res.foo, 'Foo')
    })
})

test('handle http error promise', (t) => {
  const mockErr = new Error('Not Found')
  const { getres } = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Foo' }
  })
  return getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    })
    .catch((err) => {
      t.is(err.message, 'Job error /foo.txt. Not Found')
    }
  )
})

test.cb('progress with callback', (t) => {
  const events = []
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' },
    '/baz.txt': { body: 'Baz' }
  })
  return getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' },
      baz: { src: '/baz.txt' }
    },
    (err, resources) => {
      if (err) {}

      t.deepEqual(events[0], {
        type: 'started',
        processed: 0,
        remaining: 3,
        total: 3,
        percent: 0
      })

      t.deepEqual(events[1], {
        type: 'loaded',
        processed: 1,
        remaining: 2,
        total: 3,
        percent: 1 * 100 / 3,
        src: '/foo.txt'
      })

      t.deepEqual(events[2], {
        type: 'loaded',
        processed: 2,
        remaining: 1,
        total: 3,
        percent: 2 * 100 / 3,
        src: '/bar.txt'
      })

      t.deepEqual(events[3], {
        type: 'loaded',
        processed: 3,
        remaining: 0,
        total: 3,
        percent: 3 * 100 / 3,
        src: '/baz.txt'
      })

      t.deepEqual(events[4], {
        type: 'done',
        processed: 3,
        remaining: 0,
        total: 3,
        percent: 100
      })

      t.end()
    },
    (event) => {
      events.push(event)
    }
  )
})

test.cb('progress with no jobs', (t) => {
  const events = []
  const { getres } = createGetres({})
  return getres(
    {},
    (err, resources) => {
      t.is(null, err)
      t.deepEqual(events[0], {
        type: 'started',
        processed: 0,
        remaining: 0,
        total: 0,
        percent: 0
      })
      t.deepEqual(events[1], {
        type: 'done',
        processed: 0,
        remaining: 0,
        total: 0,
        percent: 0
      })
      t.end()
    },
    (event) => {
      events.push(event)
    }
  )
})

test.cb('progress with callback', (t) => {
  const events = []
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' },
    '/baz.txt': { body: 'Baz' }
  })
  return getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' },
      baz: { src: '/baz.txt' }
    },
    (err, resources) => {
      if (err) {}

      t.deepEqual(events[0], {
        type: 'started',
        processed: 0,
        remaining: 3,
        total: 3,
        percent: 0
      })

      t.deepEqual(events[1], {
        type: 'loaded',
        processed: 1,
        remaining: 2,
        total: 3,
        percent: 1 * 100 / 3,
        src: '/foo.txt'
      })

      t.deepEqual(events[2], {
        type: 'loaded',
        processed: 2,
        remaining: 1,
        total: 3,
        percent: 2 * 100 / 3,
        src: '/bar.txt'
      })

      t.deepEqual(events[3], {
        type: 'loaded',
        processed: 3,
        remaining: 0,
        total: 3,
        percent: 3 * 100 / 3,
        src: '/baz.txt'
      })

      t.deepEqual(events[4], {
        type: 'done',
        processed: 3,
        remaining: 0,
        total: 3,
        percent: 100
      })

      t.end()
    },
    (event) => {
      events.push(event)
    }
  )
})

test.cb('set promise class', (t) => {
  t.plan(2)
  const DummyPromise = function (cb) {
    this.thenFns = []
    this.catchFns = []
    this.value = null
    this.error = null

    const resolve = function (value) {
      this.value = value
      this.thenFns.forEach((fn) => {
        fn(value)
      })
    }.bind(this)

    const reject = function (err) {
      this.err = err
      this.catchFns.forEach((fn) => {
        fn(err)
      })
    }.bind(this)

    cb(resolve, reject)
  }
  DummyPromise.prototype.then = function (cb) {
    t.pass()
    this.thenFns.push(cb)
    return this
  }
  DummyPromise.prototype.catch = function (cb) {
    this.catchFns.push(cb)
    return this
  }

  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' }
  })

  getres.Promise = DummyPromise

  getres({ foo: { src: '/foo.txt' } })
    .then((res) => {
      t.is(res.foo, 'Foo')
      t.end()
    })
})

test('error if no promise support', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' }
  })
  getres.Promise = null
  try {
    getres({ foo: { src: '/foo.txt' } })
  } catch (err) {
    t.is(err.message, 'Promises are not supported in this environment')
  }
})

test('error if non-object node', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { body: 'Foo' }
  })

  getres({ foo: [1, 2, 3] })
    .catch((err) => {
      t.is(err.message, 'Invalid node: 0')
    })
})

test.cb('send http credentials', (t) => {
  const { getres, superagent } = createGetres({
    '/foo.txt': { body: 'Foo' }
  })
  return getres(
    {
      foo: {
        src: '/foo.txt',
        credentials: true
      }
    },
    () => {
      t.true(superagent._test.withCredentialsCalled['/foo.txt'])
      t.end()
    }
  )
})

test('register custom loaders', (t) => {
  const { getres } = createGetres()

  getres
    .register('twinsen', (node, cb) => {
      cb(null, 'Twinsen ' + node.src)
    })
    .register('joe', (node, cb) => 'the-elf')

  return getres({
    zoe: {
      src: 'some-file',
      type: 'twinsen'
    },
    elf: {
      src: 'another-file',
      type: 'joe'
    }
  }).then(({ zoe, elf }) => {
    t.is(zoe, 'Twinsen some-file')
    t.is(elf, 'the-elf')
  })
})

test.cb('callback only called once', (t) => {
  const { getres } = createGetres({
    '/foo.txt': { err: new Error('Not Found') },
    '/bar.txt': { err: new Error('Not Found') }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    },
    (err, res) => {
      t.true(err !== null)
      t.end()
    }
  )
})
