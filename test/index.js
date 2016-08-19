var test = require('ava')
var proxyquire = require('proxyquire')
var stubImages = require('./fixtures/stub-images')

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
      '/zoe.png': { body: stubImages.png.input }
    })
  })
  getres(
    {
      zoe: { src: '/zoe.png', type: 'image' }
    },
    function (err, res) {
      t.is(err, null)
      t.deepEqual(res.zoe, stubImages.png.expect)
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
