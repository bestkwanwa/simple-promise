# 🍰 This is a simple implementation of Promises.

```sh
# install packages
pnpm i
# run test
pnpm run test
```

## Promises/A+
[Promises/A+](https://promisesaplus.com/)

### then方法
- then方法可以被调用多次
    ```js
    let p=new Promise()
    p.then()
    p.then()
    p.then()
    ```
- then方法返回promise，且此promise的状态由接收的回调决定
- then方法接收的回调在上一个promise状态凝固后才调用

### 处理value
- resolve接收当前promise，会报TypeError。
- resolve接收一个promise，会沿用它的state和result。
- resolve接收一个thenable对象，取它的then方法，作为executor创建promise。

## Others

### Thenable对象
```js
const thenable={
    then(resolve, reject){
         setTimeout(() => resolve('thenable'), 100);
    }
}
Promise.resolve().
  then(() => thenable).
  then(v => {
    v; // 'thenable'
  });
```

## TODO
- Promsie.resolve
- Promise.reject
- Promise.all
- Promise.race
- class style


## References
- [Thenables in JavaScript](https://masteringjs.io/tutorials/fundamentals/thenable)
- [100 行代码实现 Promises/A+ 规范](https://mp.weixin.qq.com/s/qdJ0Xd8zTgtetFdlJL3P1g)
- [ES6 - Promise 对象](https://es6.ruanyifeng.com/#docs/promise)