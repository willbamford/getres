var createJob = require('./create-job')

function createJobs () {
  var jobs = []
  var runError

  function add (job) {
    jobs.push(job)
  }

  function remove (job) {
    var n = jobs.indexOf(job)
    if (n !== -1) {
      jobs.splice(n, 1)
    }
  }

  function empty () {
    return jobs.length === 0
  }

  return {
    enqueue: function (src, node) {
      var job = createJob(src, node)
      add(job)
      return job
    },
    process: function (cb) {

      function onJobDone (err, resource, job) {
        remove(job)
        if (err) {
          runError = new Error('Job error ' + job.src + '. ' + err.message)
          return cb(runError)
        }
        if (empty() && !runError) {
          return cb(null)
        }
      }

      jobs.forEach(function (job) {
        job.listen(onJobDone).process()
      })
    }
  }
}

module.exports = createJobs
