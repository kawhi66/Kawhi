---
title: This 的指向
date: 2019-04-28 22:51:48
tags: ES6
---

以前总觉得 _this_ 应该和作用域链有关系，在应对类似的问题时，总是不由自主地从作用域链去分析。事实上，作用域链和 _this_ 的指向没有半毛钱关系。原因很简单，对一个函数而言，它的作用域链早在函数声明的时候就决定了，而 _this_ 的指向要到运行期才能决定。

# 简介

在 [scope-and-this-in-js](https://github.com/kawhi66/scope-and-this-in-js) 中，我尽可能地列举了不同的 JavaScript 环境（浏览器环境和 Node 环境）和不同的应用场景下，_this_ 这个特殊的引用的指向。很难用一句话准确的概括所有的场景，但最接近的可以是：在全局环境中，_this_ 总是指向顶层对象；而函数中的 _this_ 往往指向的是该函数的调用对象。

# 不同的执行环境

浏览器环境和 Node 环境一个很重要的差别就是[顶层对象](http://es6.ruanyifeng.com/#docs/let#顶层对象的属性)的不同。在实际的测试过程中发现，事实也确是如此。在 _this_ 指向顶层对象的场景中，对浏览器环境而言就是 window，在 Node 环境中则是 global。

# 不同的场景

我主要列举了以下几种场景：

-   函数定义在全局环境中，并且在全局环境中执行
-   函数定义在局部作用域内（定义在闭包或者引用类型变量中），在全局环境中执行
-   基于类生成的实例对象（类分别由构造函数和 Class 关键字定义）

大部分场景下的表现是符合预期的，但有一种场景很特殊：

```JavaScript
// define in prototype of an ES6 class, assign to variable, and called in global context
class Foo {
    constructor() {
        this.user = 'kawhi'
    }

    getUser() {
        return this.user
    }

    fn() {
        const _this = this
        return _this
    }
}

const instance = new Foo()
const fn = instance.fn
fn()
```

这种场景下的 _this_，无论是浏览器环境或 Node 环境都是 _undefined_。对比 Foo 的 ES5 实现：

```JavaScript
// define in prototype of an ES5 class, assign to a variable, and called in global context
function Foo() {
    this.user = 'kawhi'
}
Foo.prototype.getUser = function() {
    return this.user
}
Foo.prototype.fn = function() {
    const _this = this
    return _this
}

const instance = new Foo()
const fn = instance.fn
fn()
```

此时的 _this_ 则符合预期，指向了当前环境的顶层对象。

# 疑问

我想这里只有一个解释，Class 关键字声明的类屏蔽了这种用法。如果要想彻底搞清楚这个问题，恐怕只能去分析 Class 的原生实现了，都说它只是个语法糖，想来不仅如此。
