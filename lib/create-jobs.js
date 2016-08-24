var createJob = require('./create-job')

function createJobs () {
  var jobs = []

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
    enqueue: function (src, node, cb) {
      add(createJob(src, node, cb))
    },
    process: function (cb) {
      var runError

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
        job.process(onJobDone)
      })
    }
  }
}

module.exports = createJobs
