---
title: ECMAScript 2015(ES6)：异步编程 Promise 篇
date: 2018-07-19 09:16:35
tags: ES6
---
未完待续。。。

# 一、单线程与异步

+ [JavaScript 既是单线程又是异步的，请问这二者是否冲突，以及有什么区别？](https://www.zhihu.com/question/20866267)
+ [JavaScript既然是单线程的，那么异步要怎么理解？](https://segmentfault.com/q/1010000004266993/)
+ [为什么javascript是单线程？](http://blog.csdn.net/baidu_24024601/article/details/51861792)

# 二、ES5 中关于异步编程的解决方案

为了避免由于脚本执行造成的阻塞引起的浏览器**“假死”**现象带来的糟糕的用户体验，我们需要在 Js 脚本中合理的使用异步进行优化。我们可以有很多的选择，各自有各自的适用场景，我会试着把它们都列出来作为一个总结。在 ES6 之前，大概有这几种方式：

## 1、setTimeout() 方法

这是一个并不简单的方法。关于它的用法可以延伸出很多东西来，不过这里不会展开，以后的文章中可能会记录。有一篇文章可做参考：[你真会用setTimeout吗?](https://segmentfault.com/a/1190000003982302)。关于 `setTimeout(code, delay)` 的第二个参数 `delay` 定义的延迟执行的时间并不总是那么准确，在《深入浅出Nodejs》是这样说的：

> setTimeout 的主要问题在于，它并非那么精确。譬如通过 setTimeout() 设定一个任务在10毫秒后执行，但是在9毫秒之后，有一个任务占用了5毫秒的 CPU 时间片，再次轮到定时器执行时，时间就已经过期4毫秒。

## 2、callback 回调函数

和 `setTimeout()` 方法一样，这应该是异步编程最基本的方法之一。即定义函数的参数为一个 callback 回调函数，在函数内部定义 callback 的执行时机。

```bash
    function callback(){
        // 回调函数...
    };

    function foo(callback) {
        // 在foo函数内部定义callback在1秒后执行
        setTimeout(function() {
            callback();
        }, 1000);
    };

    foo(callback)
```

当我们的代码逻辑并不那么复杂的时候，这种方法的优点就会体现出来。不过，随着代码复杂度的增加，回调函数会变的高度耦合，难以维护和管理。

## 3、事件监听

Js 采用事件驱动的机制来响应用户操作，任务的执行不取决于代码的顺序，而取决于某个事件是否发生。假如我们给 `id` 为 `bar` 的元素绑定单击事件，执行方法 `foo`。

```bash
    // jQuery 事件绑定
    function foo () {
        // 事件处理...
    };

    $("#id").on('click', foo)
```

这种方法也很容易理解，在很长的一段时间内我都在使用它。同样当代码逻辑变得复杂起来时，这种事件绑定就会变得低效、不太灵活。当整个应用都以事件驱动时，运行流程就会变得非常混乱，很不清晰。

## 4、发布/订阅

对事件监听做延伸，可以引出异步编程的另外一种强大的模式，即**"发布/订阅模式（publish-subscribe pattern）"**，又称**"观察者模式（observer pattern）"**，这里有一篇参考文章：[浅析JavaScript设计模式——发布-订阅/观察者模式](http://blog.csdn.net/q1056843325/article/details/53353850)。这种模式虚拟一个**"信号中心"**，某个任务执行完成，就向信号中心**"发布（publish）"**一个信号，其他任务可以向信号中心**"订阅（subscribe）"**这个信号，从而知道什么时候自己可以开始执行。下面是一个例子（来自[Javascript异步编程的4种方法](http://www.ruanyifeng.com/blog/2012/12/asynchronous%EF%BC%BFjavascript.html)）:

```bash
    ## 发布/订阅模式的一种实现
    ## 来自 Ben Alman 的 [Tiny Pub/Sub](https://github.com/cowboy/jquery-tiny-pubsub)

    // f2 向 "信号中心" jQuery 订阅 "done" 信号
    jQuery.subscribe("done", f2);

    // f1 向 "信号中心" jQuery 发布 "done" 信号
    function f1() {
        setTimeout(function() {
            jQuery.publish("done"); // "done" 信号发布后，f2 即开始执行
        }, 1000);
    };

    // f2 取消订阅（unsubscribe）
    jQuery.unsubscribe("done", f2);
```

这种模式下，“消息中心”（上例中是 `jQuery` ）完成信号的接收和分发，函数间不发生直接联系。通过查看“消息中心”，我们可以了解存在多少信号、每个信号有多少订阅者，从而监控程序的运行。

在 ES6 以后（包括 ES6 ），我们有了更多的选择，比如 [Promise](http://es6.ruanyifeng.com/#docs/promise)。准确的说，Promise 并不是 ES6 新的语言特性，它早在 ES6 之前就由社区提出并实现，ES6 将其写进了语言标准，统一了用法，原生提供了 Promise 对象。本文接下来的部分会针对 Promise 做重点介绍，除了 Promise，ES6 还提供了异步编程的另一种解决方案 [Generator](http://es6.ruanyifeng.com/#docs/generator) 函数，ES7 标准还引入了 [async](http://es6.ruanyifeng.com/#docs/async) 函数，关于后面两种方法的研究和介绍会在之后的文章中展开。

# 三、Promise

之前说过了，严格来说 Promise 并不是 ES6 新的语言特性，它早在 ES6 之前就由社区提出并实现了。在 JavaScript 的世界里，最早得到广泛使用的 Promise 是 jQuery 的 AJAX 模块中出现的 `jQuery.Deferred()`。[Promise/A+](https://promisesaplus.com/) 标准规定了一系列 API，并配有大量的测试用例，ES6 直接整合了这个标准。Promise 的出现是为了更好的处理 JavaScript 异步回调中无法避免的多层嵌套（Callback Hell，回调地狱）现象。在 [Promise/A+](https://promisesaplus.com/) 规范中有如下规定：

+ Promise 对象有且只有三种状态，Pending：Promise 对象的初始状态，在任务执行完成前将始终保持这个状态；Fulfilled：任务成功执行完成的状态；Rejected：任务执行完成但执行失败的状态；
+ Promise 的状态只可能从 Pending 状态转到 Fulfilled 状态或者是由 pending 状态转为 Rejected 状态，而且不能逆向转换，同时 Fulfilled 状态和 Rejected 状态也不能相互转换；
+ Promise 对象必须实现 then 方法，then 是 promise 规范的核心，而且 then 方法也必须返回一个 Promise 对象，同一个 Promise 对象可以注册多个 then 方法，并且回调的执行顺序跟它们的注册顺序一致；
+ then 方法接受两个回调函数，它们分别为成功时的回调和失败时的回调，并且它们分别在：Promise 由 Pending 状态转换到 Fulfilled 状态时被调用和 Promise 由 Pending 状态转换到 Rejected 状态时被调用。

## 1、概览

所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。
Promise 也有一些缺点。首先，无法取消 Promise，**一旦新建它就会立即执行**，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。第三，当处于 pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 2、基本用法

ES6 规定，Promise 对象是一个构造函数，可以用来生成 Promise 实例。Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，由 ES6 原生提供，不用自己实现。

其中，resolve 函数的作用是，将 Promise 对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；reject 函数的作用是，将 Promise 对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

```bash
    // 生成一个 Promise 实例
    const p = new Promise(function(resolve, reject) {
      // ... some code
    
      if (/* 异步操作成功 */){
        resolve(value);
      } else {
        reject(error);
      }
    });
```

Promise 实例生成以后，可以用 then 方法分别指定 resolved 状态和 rejected 状态的回调函数。其中，第二个函数是可选的，不一定要提供。这两个函数都接受 Promise 对象传出的值作为参数。

```bash
    // 一个 Promise 对象的简单例子
    function timeout(ms) {
      return new Promise((resolve, reject) => {
        // setTimeout 的第三个参数及其以后的参数都会作为参数传递给 resolve 函数
        setTimeout(resolve, ms, 'done');
      });
    }
    
    timeout(100).then((value) => {
      console.log(value);
    });
```

**Promise 实例新建后就会立即执行**。

```bash
    let p = new Promise(function(resolve, reject) {
      // Promise 实例 p 新建后就会立即执行
      // “Promise” 会先打印出来
      console.log('Promise');
      resolve();
    });
    
    promise.then(function() {
      // then 方法指定的回调函数，将在**当前脚本所有同步任务执行完**才会执行
      // “resolved.” 会最后打印出来
      console.log('resolved.');
    });
    
    console.log('Hi!');
    
    // Promise
    // Hi!
    // resolved
```

如果调用 resolve 函数和 reject 函数时带有参数，那么它们的参数会被传递给回调函数。reject 函数的参数通常是 Error 对象的实例，表示抛出的错误；resolve 函数的参数除了正常的值以外，还可能是另一个 Promise 实例，比如像下面这样：

```bash
    const p1 = new Promise(function (resolve, reject) {
        // ...
    });
    
    const p2 = new Promise(function (resolve, reject) {
        // ...
        resolve(p1);
    })
```

注意，这时 p1 的状态就会传递给 p2，也就是说，p1 的状态决定了 p2 的状态。如果 p1 的状态是 pending，那么 p2 的回调函数就会等待 p1 的状态改变；如果 p1 的状态已经是 resolved 或者 rejected，那么 p2 的回调函数将会立刻执行。

注意，**调用 resolve 或 reject 并不会终结 Promise 的参数函数的执行**。

```bash
    new Promise((resolve, reject) => {
      resolve(1);
      console.log(2);
    }).then(r => {
      console.log(r);
    });

    // 2
    // 1
```

一般来说，调用 resolve 或 reject 以后，Promise 的使命就完成了，后继操作应该放到 then 方法里面，而不应该直接写在 resolve 或 reject 的后面。所以，最好在它们前面加上 return 语句，这样就不会有意外。

```bash
    new Promise((resolve, reject) => {
      return resolve(1);
      // 后面的语句不会执行
      console.log(2);
    })
```

## 原型方法
## 延伸

# 总结