module.exports = function () {
  var jobs = []
  return {
    add: function (job) {
      jobs.push(job)
      return this
    },
    remove: function (job) {
      var n = jobs.indexOf(job)
      if (n !== -1) {
        jobs.splice(n, 1)
      }
      return this
    },
    count: function () {
      return jobs.length
    },
    empty: function () {
      return jobs.length === 0
    },
    all: function () {
      return jobs
    },
    each: function (fn) {
      jobs.forEach(fn)
      return this
    }
  }
}
