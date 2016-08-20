const test = require('ava')
const proxyquire = require('proxyquire')
const images = require('./fixtures/images')

function mockSuperagent (reqs) {
  return {
    get: function (url) {
      this.url = url
      return this
    },
    end: function (cb) {
      const req = reqs[this.url]
      if (req.err) {
        cb(req.err)
      } else {
        cb(null, { body: req.body })
      }
    }
  }
}

function createGetres (reqs) {
  // TODO: mock loaders and add unit tests around loaders instead
  return proxyquire('../lib', {
    './loaders/http': proxyquire('../lib/loaders/http', {
      'superagent': mockSuperagent(reqs)
    }),
    './loaders/image': proxyquire('../lib/loaders/image', {
      './http': proxyquire('../lib/loaders/http', {
        'superagent': mockSuperagent(reqs)
      })
    }),
    './loaders/json': proxyquire('../lib/loaders/json', {
      './http': proxyquire('../lib/loaders/http', {
        'superagent': mockSuperagent(reqs)
      })
    })
  })
}

test.cb('get text', (t) => {
  const getres = createGetres({
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

test.cb('get json', (t) => {
  const getres = createGetres({
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
  const getres = createGetres({
    '/invalid.json': { body: '{ "hello: "world!" }' }
  })
  getres(
    {
      zoe: { src: '/invalid.json', type: 'json' }
    },
    (err, res) => {
      t.is(err.name, 'SyntaxError')
      t.end()
    }
  )
})

test.cb('get png image', (t) => {
  const getres = createGetres({
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
  const getres = createGetres({
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
  const getres = createGetres({
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
  const getres = createGetres({
    '/corrupt.png': { body: images.corruptPng.input }
  })
  getres(
    {
      img: { src: '/corrupt.png', type: 'image' }
    },
    (err, res) => {
      t.is(err.message, 'Invalid PNG buffer')
      t.end()
    }
  )
})

test.cb('handle manifest type error', (t) => {
  const getres = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt', type: 'invalid' }
    },
    (err, res) => {
      t.is(err.message, 'Invalid manifest type: invalid')
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('handle http errors', (t) => {
  const mockErr = { Error: 'Not Found' }
  const getres = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Foo' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    },
    (err, res) => {
      t.is(err, mockErr)
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('use parser function', (t) => {
  const getres = createGetres({ '/world.txt': { body: 'hello world' } })
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: function (resource, cb) {
          cb(null, resource.toUpperCase())
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

test.cb('handle parser error', (t) => {
  const getres = createGetres({ '/world.txt': { body: 'hello world' } })
  const expectErr = new Error('Parse this!')
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: function (resource, cb) {
          cb(expectErr)
        }
      }
    },
    (err, res) => {
      t.is(err, expectErr)
      t.end()
    }
  )
})

test('get text promise', (t) => {
  const getres = createGetres({
    '/foo.txt': { body: 'Foo' }
  })
  return getres({ foo: { src: '/foo.txt' } })
    .then((res) => {
      t.is(res.foo, 'Foo')
    })
})

test('handle http error promise', (t) => {
  const mockErr = { Error: 'Not Found' }
  const getres = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Foo' }
  })
  return getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    })
    .catch((err) => {
      t.is(err, mockErr)
    })
})

test.todo('progress')
test.todo('per resource callbacks')
test.todo('abort outstanding requests on error')
