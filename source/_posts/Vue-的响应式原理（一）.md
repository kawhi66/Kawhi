---
title: Vue 的响应式原理（一）
date: 2019-05-05 18:11:44
tags: Vue
---

Vue 在组件实例初始化的时候，会遍历 data 函数返回值的所有属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter。在组件渲染的过程中，Vue 会以这些属性为依赖生成 Watcher 实例，之后当依赖项的 setter 触发时，会通知 Watcher，从而使它关联的组件重新渲染。本文是本系列文章的第一篇：理解 Object.defineProperty。

![](/render.png)

_注：本文（及本系列）所有的内容都是基于 Vue V2.6.10 版本。_

# 简介

该方法允许精确添加或修改对象的属性。通过赋值操作添加的普通属性是可枚举的，能够在属性枚举期间呈现出来（`for...in` 或 `Object.keys` 方法），这些属性的值可以被改变，也可以被删除。这个方法允许修改默认的额外选项（或配置），而在默认情况下，使用 Object.defineProperty 添加的属性值是不可修改的。这个方法接收三个参数：属性所在的对象、属性的名字和一个属性描述符对象。其中，属性描述符对象必须是**数据描述符（数据属性）**或**存取描述符（访问器属性）**两种形式之一；不能同时是两者。

```JavaScript
'use strict';

try {
    const obj = {}
    Object.defineProperty(obj, 'prop', {
        value: 123
    })
    delete obj.prop
} catch (error) {
    console.error(error) // Cannot delete property 'prop' of #<Object>
}
```

在严格模式下，删除通过 Object.defineProperty 定义的属性 `prop` 会导致异常抛出；而在非严格模式下，`delete obj.prop` 将不会产生任何效果。

# 属性描述符

对象里目前存在的属性描述符有两种主要形式：**数据描述符（数据属性）**和**存取描述符（访问器属性）**。**描述符必须是这两种形式之一；不能同时是两者**。

## 数据描述符（数据属性）

数据属性是一个具有值的属性，该值可能是可写的，也可能不是可写的。数据属性有 4 个描述其行为的特性：

-   \[[ Configurable ]] - 表示能否通过 `delete` 删除属性从而重新定义属性；能否修改属性的特性；或者能否把属性修改为访问器属性。通过赋值操作符直接在对象上定义的属性，他们的 \[[ Configurable ]] 特性默认为 `true`。
-   \[[ Enumerable ]] - 表示能否通过 `for...in` 或 `Object.keys` 方法对属性进行枚举。通过赋值操作符直接在对象上定义的属性，他们的 \[[ Enumerable ]] 特性默认为 `true`。
-   \[[ Writable ]] - 表示能否修改属性的值。通过赋值操作符直接在对象上定义的属性，他们的 \[[ Writable ]] 特性默认为 `true`。
-   \[[ Value ]] - 包含这个属性的数据值。读取属性值的时候，从这个位置读；写入属性值的时候，把新值保存在这个位置。这个特性的默认值是 `undefined`。

```JavaScript
'use strict';

try {
    const obj = {}
    Object.defineProperty(obj, 'prop', {
        configurable: true,
        enumerable: false, // 可以省略
        writable: false, // 可以省略
        value: 123
    })
    delete obj.prop // 这里的 delete 操作不会抛出异常
} catch (error) {
    console.error(error)
}
```

## 存取描述符（访问器属性）

访问器属性是由 getter-setter 函数对（这两个函数都不是必须的）描述的属性；访问器属性不包含数据值。在读取访问器属性时，会调用 getter 函数，这个函数负责返回有效的值；在写入访问器属性时，会调用 setter 函数并传入新值，这个函数负责决定如何处理数据。访问器属性有如下 4 个特性：

-   \[[ Configurable ]] - 表示能否通过 `delete` 删除属性从而重新定义属性；能否修改属性的特性；或者能否把属性修改为访问器属性。通过赋值操作符直接在对象上定义的属性，他们的 \[[ Configurable ]] 特性默认为 `true`。
-   \[[ Enumerable ]] - 表示能否通过 `for...in` 或 `Object.keys` 方法对属性进行枚举。通过赋值操作符直接在对象上定义的属性，他们的 \[[ Enumerable ]] 特性默认为 `true`。
-   \[[ Get ]] - 在读取属性时调用的函数。这个特性的默认值是 `undefined`。
-   \[[ Set ]] - 在写入属性时调用的函数。这个特性的默认值是 `undefined`。

```JavaScript
'use strict';

try {
    const book = {
        _year: 2004,
        edition: 1
    }

    Object.defineProperty(book, 'year', {
        get: function () {
            return this._year
        },
        set: function (newValue) {
            this.edition += newValue - this._year
            this._year = newValue
        }
    })

    book.year = 2005
    console.log(book.edition) // 2
} catch (error) {
    console.error(error)
}
```

上面的代码是使用访问器属性的常见方式，即设置一个属性的值会导致其他属性发生变化。不一定非要同时指定 getter 和 setter。只指定 getter 意味着属性是只读属性，尝试写入属性会被忽略，在严格模式下会抛出错误。类似地，只指定 setter 函数的属性在读取时会返回 `undefined`。

```JavaScript
'use strict';

try {
    const book = {
        _year: 2004,
        edition: 1
    }

    Object.defineProperty(book, 'year', {
        get: function () {
            return this._year
        }
    })

    book.year = 2005
} catch (error) {
    console.error(error) // Cannot set property year of #<Object> which has only a getter
}

try {
    const book = {
        _year: 2004,
        edition: 1
    }

    Object.defineProperty(book, 'year', {
        set: function (newValue) {
            this.edition += newValue - this._year
            this._year = newValue
        }
    })

    book.year = 2005
    console.log(book.edition) // 2
    console.log(book.year) // undefined
} catch (error) {
    console.error(error)
}
```

_注：只指定 setter 函数的属性在读取时，无论在严格模式还是非严格模式下都没有抛出异常，而是返回了 `undefined`。_

## 两个非标准方法

在 Object.defineProperty 之前，要创建访问器属性，一般都使用两个非标准的方法：`Object.prototype.__defineGetter__` 和 `Object.prototype.__defineSetter__`。

```JavaScript
'use strict';

try {
    const book = {
        _year: 2004,
        edition: 1
    }

    book.__defineGetter__('year', function () {
        return this._year
    })

    book.__defineSetter__('year', function (newValue) {
        this.edition += newValue - this._year
        this._year = newValue
    })

    book.year = 2005
    console.log(book.edition)
} catch (error) {
    console.error(error)
}
```

# 可能的问题

需要注意的是，有些文章指出，Object.defineProperty 并不总是工作的很好，它可能会存在性能问题，比如：[Hidden performance implications of Object.defineProperty()](https://humanwhocodes.com/blog/2015/11/performance-implication-object-defineproperty/)。今年将要发布的 Vue3 使用 [ES2015 Proxies](http://es6.ruanyifeng.com/#docs/proxy) 取代了 Object.defineProperty。下一篇文章将从源码角度分析 Object.defineProperty 在 Vue 中的使用。
