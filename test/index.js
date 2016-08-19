var test = require('ava')
var proxyquire = require('proxyquire')
var imageStubs = require('./fixtures/images')

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

test.cb('get text', (t) => {
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/foo.txt': { body: 'Foo' },
      '/bar.txt': { body: 'Bar' }
    })
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
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/zoe.json': { body: '{ "hello": "world!" }' }
    })
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
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/img.png': { body: imageStubs.png.input }
    })
  })
  getres(
    {
      img: { src: '/img.png', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img, imageStubs.png.expect)
      t.end()
    }
  )
})

test.cb('get gif image', (t) => {
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/img.gif': { body: imageStubs.gif.input }
    })
  })
  getres(
    {
      img: { src: '/img.gif', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img, imageStubs.gif.expect)
      t.end()
    }
  )
})

test.cb('get jpg image', (t) => {
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/img1.jpg': { body: imageStubs.jpg.input },
      '/img2.jpeg': { body: imageStubs.jpg.input }
    })
  })
  getres(
    {
      img1: { src: '/img1.jpg', type: 'image' },
      img2: { src: '/img2.jpeg', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.img1, imageStubs.jpg.expect)
      t.deepEqual(res.img2, imageStubs.jpg.expect)
      t.end()
    }
  )
})

test.cb('handle manifest type error', (t) => {
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/foo.txt': { body: 'Foo' },
      '/bar.txt': { body: 'Bar' }
    })
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
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({
      '/foo.txt': { err: mockErr },
      '/bar.txt': { body: 'Foo' }
    })
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
  var getres = proxyquire('../lib', {
    superagent: mockSuperagent({ '/world.txt': { body: 'hello world' } })
  })
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
