var createJob = require('./create-job')

function createJobs (loaders) {
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
    enqueue: function (src, node) {
      var job = createJob(src, node, loaders)
      add(job)
      return job
    },
    process: function (callback, progress) {
      var processed = 0
      var total = jobs.length
      var cbCalled = false

      function sendProgress (type, props) {
        if (!progress) {
          return
        }
        props = props || {}
        var event = {
          type: type,
          processed: processed,
          remaining: jobs.length,
          total: total,
          percent: !total ? 0 : processed * 100 / total
        }
        Object.keys(props).forEach(function (key) {
          event[key] = props[key]
        })
        progress(event)
      }

      function checkDone () {
        if (empty() && !cbCalled) {
          cbCalled = true
          sendProgress('done')
          callback(null)
        }
      }

      function onJobDone (err, resource, job) {
        remove(job)
        processed += 1

        if (cbCalled) {
          return
        }

        if (err) {
          cbCalled = true
          sendProgress('error', { src: job.src })
          return callback(new Error('Job error ' + job.src + '. ' + err.message))
        }

        sendProgress('loaded', { src: job.src })
        checkDone()
      }

      sendProgress('started')
      checkDone() // No jobs

      jobs.forEach(function (job) {
        job.listen(onJobDone).process()
      })
    }
  }
}

module.exports = createJobs
