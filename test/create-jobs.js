var test = require('ava')
var createJob = require('../lib/create-job')
var createJobs = require('../lib/create-jobs')

test('add / remove / count / empty / all', (t) => {
  var jobs = createJobs()
  t.is(jobs.count(), 0)
  t.is(jobs.empty(), true)
  var one = createJob('one')
  var two = createJob('two')
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

test('each', (t) => {
  var jobs = createJobs()
  var s = ''
  jobs
    .add(createJob('one'))
    .add(createJob('two'))
  jobs.each((job) => {
    s += `[${job.src}]`
  })
  t.is(s, '[one][two]')
})
