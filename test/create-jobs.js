var test = require('ava')
var createJobs = require('../lib/create-jobs')

test('add / remove / count / empty / all', (t) => {
  var jobs = createJobs()
  t.is(jobs.count(), 0)
  t.is(jobs.empty(), true)
  var one = { src: 'one' }
  var two = { src: 'two' }
  jobs
    .add(one)
    .add(two)
  t.is(jobs.count(), 2)
  t.is(jobs.empty(), false)
  t.deepEqual(jobs.all(), [one, two])
  jobs
    .remove(two)
    .remove(one)
  t.is(jobs.empty(), true)
  t.deepEqual(jobs.all(), [])
})
