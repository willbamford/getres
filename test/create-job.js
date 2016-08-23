var test = require('ava')
var createJob = require('../lib/create-job')

test('create', (t) => {
  var job = createJob(
    'source',
    {
      type: 'image',
      parser: (resource, cb) => {
        cb(resource)
      }
    },
    (resource) => { /* */ }
  )
  t.is(job.src, 'source')
  t.is(job.type, 'image')
})
