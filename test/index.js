var test = require('ava')

var ual = require('../lib/index.js')

test('is function', function (t) {
  t.is(typeof ual, 'function')
})
