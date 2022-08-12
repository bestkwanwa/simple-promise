const SimplePromise = require('./index')

const resolved = value => new SimplePromise(resolve => resolve(value))
const rejected = reason => new SimplePromise((_, reject) => reject(reason))

const deferred = () => {
  let promise, resolve, reject
  promise = new SimplePromise(($resolve, $reject) => {
    resolve = $resolve
    reject = $reject
  })
  return { promise, resolve, reject }
}

module.exports = { resolved, rejected, deferred }
