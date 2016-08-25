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
    process: function (callback, progress) {
      var processed = 0
      var total = jobs.length

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
        if (empty() && !runError) {
          sendProgress('done')
          callback(null)
        }
      }

      function onJobDone (err, resource, job) {
        remove(job)
        processed += 1
        if (err) {
          runError = new Error('Job error ' + job.src + '. ' + err.message)
          return callback(runError)
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
