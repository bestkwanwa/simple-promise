const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function isFunction(obj) {
    return typeof obj === 'function'
}
function isObject(obj) {
    return !!(obj && typeof obj === 'object')
}
function isThenable(obj) {
    return (isFunction(obj) || isObject(obj)) && 'then' in obj
}
function isPromise(promise) {
    return promise instanceof SimplePromise
}
function transition(promise, state, result) {
    if (promise.state !== PENDING) return
    promise.state = state
    promise.result = result
    setTimeout(() => {
        handleCallbacks(promise.callbacks, state, result)
    })
}

function handleCallback(callback, state, result) {
    let {
        onFulfilled,
        onRejected,
        resolve,
        reject
    } = callback
    try {
        if (state === FULFILLED) {
            isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
        }
        if (state === REJECTED) {
            isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
        }
    } catch (error) {
        reject(error)
    }
}

function handleCallbacks(callbacks, state, result) {
    while (callbacks.length) {
        handleCallback(callbacks.shift(), state, result)
    }
}

function resolvePromise(promise, result, resolve, reject) {
    if (result === promise) {
        let reason = new TypeError('Chaining cycle detected for promise.')
        return reject(reason)
    }
    if (isPromise(result)) {
        return result.then(resolve, reject)
    }
    if (isThenable(result)) {
        try {
            let then = result.then
            if (isFunction(then)) {
                return new SimplePromise(then.bind(result)).then(resolve, reject)
            }
        } catch (error) {
            return reject(error)
        }
    }
    resolve(result)
}

function SimplePromise(fn) {
    this.result = null
    this.state = PENDING
    this.callbacks = []

    let onFulfilled = value => transition(this, FULFILLED, value)
    let onRejected = reason => transition(this, REJECTED, reason)

    let skip = false
    let resolve = value => {
        if (skip) return
        skip = true
        resolvePromise(this, value, onFulfilled, onRejected)
    }
    let reject = reason => {
        if (skip) return
        skip = true
        onRejected(reason)
    }

    try {
        fn(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

SimplePromise.prototype.then = function (onFulfilled, onRejected) {
    return new SimplePromise((resolve, reject) => {
        let callback = { onFulfilled, onRejected, resolve, reject }
        if (this.state === PENDING) {
            this.callbacks.push(callback)
        } else {
            setTimeout(() => {
                handleCallback(callback, this.state, this.result)
            })
        }
    })
}

module.exports = SimplePromise
