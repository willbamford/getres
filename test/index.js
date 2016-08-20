var test = require('ava')
var proxyquire = require('proxyquire')
var images = require('./fixtures/images')

function mockSuperagent (reqs) {
  return {
    get: function (url) {
      this.url = url
      return this
    },
    end: function (cb) {
      var req = reqs[this.url]
      if (req.err) {
        cb(req.err)
      } else {
        cb(null, { body: req.body })
      }
    }
  }
}

function createGetres (reqs) {
  return proxyquire('../lib', {
    superagent: mockSuperagent(reqs)
  })
}

test.cb('get text', (t) => {
  var getres = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt', type: 'text' }
    },
    function (err, res) {
      t.is(err, null)
      t.is(res.foo, 'Foo')
      t.is(res.bar, 'Bar')
      t.end()
    }
  )
})

test.cb('get json', (t) => {
  var getres = createGetres({
    '/zoe.json': { body: '{ "hello": "world!" }' }
  })
  getres(
    {
      zoe: { src: '/zoe.json', type: 'json' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.zoe, { hello: 'world!' })
      t.end()
    }
  )
})

test.cb('get png image', (t) => {
  var getres = createGetres({
    '/img.png': { body: images.png.input }
  })
  getres(
    {
      img: { src: '/img.png', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img, images.png.expect)
      t.end()
    }
  )
})

test.cb('get gif image', (t) => {
  var getres = createGetres({
    '/img.gif': { body: images.gif.input }
  })
  getres(
    {
      img: { src: '/img.gif', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img, images.gif.expect)
      t.end()
    }
  )
})

test.cb('get jpg image', (t) => {
  var getres = createGetres({
    '/img1.jpg': { body: images.jpg.input },
    '/img2.jpeg': { body: images.jpg.input }
  })
  getres(
    {
      img1: { src: '/img1.jpg', type: 'image' },
      img2: { src: '/img2.jpeg', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img1, images.jpg.expect)
      t.deepEqual(res.img2, images.jpg.expect)
      t.end()
    }
  )
})

test.cb('corrupt png image error', (t) => {
  var getres = createGetres({
    '/corrupt.png': { body: images.corruptPng.input }
  })
  getres(
    {
      img: { src: '/corrupt.png', type: 'image' }
    },
    function (err, res) {
      t.is(err.message, 'Invalid PNG buffer')
      t.end()
    }
  )
})

test.cb('handle manifest type error', (t) => {
  var getres = createGetres({
    '/foo.txt': { body: 'Foo' },
    '/bar.txt': { body: 'Bar' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt', type: 'invalid' }
    },
    function (err, res) {
      t.is(err.message, 'Invalid manifest type: invalid')
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('handle http errors', (t) => {
  var mockErr = { Error: 'Not Found' }
  var getres = createGetres({
    '/foo.txt': { err: mockErr },
    '/bar.txt': { body: 'Foo' }
  })
  getres(
    {
      foo: { src: '/foo.txt' },
      bar: { src: '/bar.txt' }
    },
    function (err, res) {
      t.is(err, mockErr)
      t.deepEqual(res, {})
      t.end()
    }
  )
})

test.cb('use parser function', (t) => {
  var getres = createGetres({ '/world.txt': { body: 'hello world' } })
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: function (resource) {
          return resource.toUpperCase()
        }
      }
    },
    function (err, res) {
      t.is(err, null)
      t.is(res.hello, 'HELLO WORLD')
      t.end()
    }
  )
})

test.cb('parser error', (t) => {
  var getres = createGetres({ '/world.txt': { body: 'hello world' } })
  var expectErr = new Error('Parse this!')
  getres(
    {
      hello: {
        src: '/world.txt',
        parser: function (resource) {
          throw expectErr
        }
      }
    },
    function (err, res) {
      t.is(err, expectErr)
      t.end()
    }
  )
})
