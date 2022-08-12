const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

let count = 0

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
            isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)   // 这里要把onRejected的结果resolve出去，因为then返回的Promise默认就是fulfilled态的
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

const resolvePromise = (promise, result, resolve, reject) => {
    if (result === promise) {
        let reason = new TypeError('Can not fufill promise with itself')
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

    this.count = count++

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

let thenableObj = {
    then(res, rej) {
        setTimeout(() => {
            console.log('thenable');
            res('thenable res')
        }, 3000);
    }
}

/**
 * 0
 */
let p = new SimplePromise((resolve, reject) => {
    setTimeout(() => {
        resolve('resolve')
    });
})

/**
 * 1
 */
let np = new SimplePromise((_, rej) => {
    rej('np fail')
})
// let nnp=new SimplePromise((res,rej)=>{
//     setTimeout(() => {
//         res('third promise resolve')
//     }, 1000);
// })

/**
 * 2
 */
p.then(msg => {
    console.log(msg);
    // return thenableObj
    return np   // 4
}).then(res => {            // 3
    console.log('sec resolve', res, count);

}, err => {
    console.log('sec rej', err, count);
})
// let np = p.then((res) => {
//     console.log('first then', res);
// }, rea => {
//     console.log('rej', rea);
//     return Promise.reject('give you a reject')
// }).then(res => {
//     console.log('sec then resolve', res);
// },err=>{
//     console.log('sec then reject',err);
// })
// np.then(res=>{
//     console.log('np then',res);
// },err=>{
//     console.log('np then err',err);
// })