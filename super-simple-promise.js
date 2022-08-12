function SuperSimplePromise() {
    var _onFulFilled = null
    this.then = function (onFulFilled) {
        _onFulFilled = onFulFilled
    }
    function resolve(value) {
        setTimeout(() => {
            // 延迟调用。在 Promise 中使用微任务达到延迟调用的效果。
            _onFulFilled(value)
        })
    }
    executor(resolve, null);
}

// test
function executor(resolve, reject) {
    resolve('resolve')  // 触发then的回调
}

let p = new SuperSimplePromise(executor)

function onFulFilled(v) {
    console.log(v);
}

p.then(onFulFilled)