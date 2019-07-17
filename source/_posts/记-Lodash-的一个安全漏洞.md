---
title: 记 Lodash 的一个安全漏洞
date: 2019-07-17 17:35:50
tags: Web安全
---

大概在两周前，Github 上 ID 为 [ceastman-ibm](https://github.com/ceastman-ibm) 的用户在 [Lodash](https://github.com/lodash/lodash) 的[源码仓库](https://github.com/lodash/lodash)中新增了一个 [issue](https://github.com/lodash/lodash/issues/4348)，指出了 [Lodash](https://github.com/lodash/lodash) 在 V4.17.11 版本上一个可能导致**原型污染（Prototype Pollution）**安全漏洞。这个漏洞使得 [Lodash](https://github.com/lodash/lodash) “连夜”发版以解决潜在问题，并强烈建议开发者升级版本。遗憾的是直到昨天晚上，我才在一个微信公众号的推送文章中得知了这个消息（我关注的都是些什么玩意儿）。由此这篇博文的主要内容就是**原型污染（Prototype Pollution）**。

# 原型和原型链

每一个 JavaScript 对象（Null 除外）都和原型对象相关联，每一个对象都从原型对象继承属性。所有通过对象直接量（就是大家熟悉的`{}`）创建的对象都具有同一个原型对象，并可以通过 `Object.prototype` 获得对原型对象的引用。所有的内置构造函数（包括大部分自定义的构造函数）都具有一个继承自 `Object.prototype` 的原型，例如，`Date.prototype` 的属性继承自 `Object.prototype`，因此由 `new Date()` 创建的 `Date` 对象的属性同时继承自 `Date.prototype` 和 `Object.prototype`。这一系列链接的原型对象就是所谓的“原型链”。

定义在原型对象上的属性叫原型属性，这个属性非常重要，以至于我们经常把 “o 的原型属性” 直接叫做 “o 的原型”。在我看来，每一个原型属性都值得我们去关注和深入的研究，这里只列出几个比较常见的，比如 `constructor` 属性（或者叫构造函数）用来在对象实例化的时候调用和执行，`isPrototypeOf` 方法用来检测某个对象是否是另一个对象的原型（或处于原型链中），还有 `toString` 方法用来表示对象的类型信息等等。

Mozilla 实现的 JavaScript 对外暴露了一个专门命名为 `__proto__` 的属性，用来直接查询/设置对象的原型。需要注意的是，尽管目前 Safari 和 Chrome 的当前版本都支持它，但并不推荐使用，如果有类似的场景，请使用 `Object.prototype`。

# 原型污染

原型污染漏洞使攻击者能够修改 Web 应用程序的 JavaScript 对象原型，如果攻击者设法将属性注入现有的 JavaScript 对象原型中，就可以操纵这些属性来覆盖或污染应用程序。这样很可能会影响应用程序通过原型链处理 JavaScript 对象的过程，从而导致拒绝服务或远程代码执行出错。先来看一个例子：

```JavaScript
let person = { name: 'lucas' }
console.log(person.name) // lucas
person.__proto__.toString = () => { alert('evil') }
console.log(person.name) // lucas
let person2 = {}
console.log(person2.toString()) // alert('evil') !!!
```

在这个例子中，我们通过 `person.__proto__.toString = () => { alert('evil') }` 重写了 `person` 原型对象（`Object.prototype`）的 `toString` 方法，导致之后创建的对象，其继承自 `Object.prototype` 的 `toString` 属性都被污染。现在再来看 [Lodash](https://github.com/lodash/lodash) 的这个严重的安全漏洞，其实原理是一样的。

[Lodash](https://github.com/lodash/lodash) 提供了 `defaultsDeep` 方法，用来分配来源对象的可枚举属性到目标对象所有解析为 `undefined` 的属性上。

```JavaScript
_.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } }) // { 'a': { 'b': 2, 'c': 3 } }
```

试想，如果我们要合并的源对象是这样定义的：

```JavaScript
const payload = JSON.parse('{"constructor": {"prototype": {"toString": null}}}')
```

现在再来执行 `_.defaultsDeep({}, payload)`，如果 `defaultsDeep` 方法没有对源对象中的属性做足够的校验，就很有可能触发原型污染。事实上，[Lodash](https://github.com/lodash/lodash) 的修复非常简单：

![](/lodash.jpg)

当遇见 `constructor` 以及 `__proto__` 敏感属性时退出程序。

# 漏洞防范

[Lodash](https://github.com/lodash/lodash) 暴露的此次安全漏洞在 [snyk.io](https://snyk.io/vuln/SNYK-JS-LODASH-73638) （这是英国一家专门检测开源代码安全漏洞的公司）上有[记录](https://snyk.io/vuln/SNYK-JS-LODASH-73638)，这篇文章提到了防范原型污染漏洞的方法，包括：

+ 使用 `Object.freeze (Object.prototype)` 冻结原型
+ 对 JSON 输入做模式校验
+ 避免使用不安全的递归合并方法
+ 使用 `Object.create(null)` 创建无原型对象
+ 使用 `Map` 取代 `Object`

# 参考文章

+ [Lodash 严重安全漏洞背后](https://zhuanlan.zhihu.com/p/73186974)
+ [Lodash库爆出严重安全漏洞，波及400万+项目](https://mp.weixin.qq.com/s/tfZq2PZylGfMjOp8h8eeTw)
+ [High severity vulnerability in 4.17.11](https://github.com/lodash/lodash/issues/4348)
+ [Prototype Pollution](https://snyk.io/vuln/SNYK-JS-LODASH-73638)
