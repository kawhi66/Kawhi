---
title: ES6：let 和 const
date: 2018-07-19 11:01:48
tags: ES6
---

ES5 中可以通过 var 关键字来声明一个变量，ES6 新增了两个关键字 let 和 const。本文要讨论的是 var 关键字声明变量存在的一些问题以及 ES6 新的特性所对应的解决方案。

# 变量提升

> 在 ES5 中，以 var 关键字声明的函数和变量总是会被 JavaScript 解释器隐式地提升(hoist)到**包含他们的作用域的最顶端**。

当发生变量提升的时候，在代码中通过 var 关键字声明的变量在**从其作用域开始到声明之前**都是可以被使用的，不过值为 undefined。看一个例子：

```bash
    # var关键字带来的变量提升
    console.log(foo); // 输出 undefined
    var foo = 0;
```

let 改变了这种语法行为，使用 let 关键字在变量声明之前它是不存在的，这时候调用会发生错误，抛出异常。

```bash
    # 使用let声明变量不会有变量提升
    console.log(bar); // ReferenceError: bar is not defined
    let bar = 0;
```

let 关键字声明变量的这种特性可以引出一个概念：**暂时性死区（temporal dead zone，简称 TDZ）**。在上述代码中，对变量 foo 而言，从作用域开始到 foo 变量被声明这段区域都可以称为变量 foo 的死区，代码运行到这个阶段时，foo 变量是不可被使用的。补充两个例子（来自 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/let)）：

```bash
    # demo 1
    var tmp = 123;
    if (true) {
      // 虽然存在全局变量 tmp，但是块级作用域内 let 又声明了一个局部变量 tmp，导致后者绑定这个块级作用域，所以在 let 声明变量前，对 tmp 赋值会报错
      tmp = 'abc'; // ReferenceError: tmp is not defined
      let tmp;
    }

    # demo 2
    # 使用 let 声明变量时，只要变量在还没有声明完成前使用，就会报错。
    var x = x;
    let x = x; // SyntaxError: Identifier 'x' has already been declared
```

> 总之，暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。

# 变量重复定义

在 ES5 中，使用 var 语句重复声明变量是合法且无害的，如果你试图读取一个没有声明的变量，Js 会报错，在 ES5 的严格模式下，给一个没有声明的变量赋值也会报错，但在非严格模式下，给一个未声明的变量赋值，Js 实际上会给全局对象创建一个同名的属性，并且工作起来像一个正确声明的全局变量。这意味着你可以侥幸不声明全局变量，但这是一个非常不好的习惯并且会造成很多 bug。**在 ES6 中，使用 let 声明的变量不允许在相同作用域内，重复声明同一个变量。**

```bash
    # demo1
    function func() {
        let a = 10;
        var a = 1; // SyntaxError: Identifier 'a' has already been declared
    }
    func();

    # demo 2
    function func() {
        let a = 10;
        let a = 1; // SyntaxError: Identifier 'a' has already been declared
    }
    func();

    # demo 3 在函数内部重新声明参数会报错
    function func(arg) {
        let arg; // SyntaxError: Identifier 'arg' has already been declared
    }
    func();

    # demo 4
    function func(arg) {
        {
            let arg; // 不会报错
        }
    }
    func();
```

# 变量作用域

> JavaScript 是基于词法作用域的语言：通过阅读包含变量定义在内的数行源码就能知道变量的作用域。全局变量在程序内始终是有定义的。局部变量在声明它的函数体内以及其所嵌套的函数体内始终是有定义的。

这是 ES5 中对于变量作用域的一个简单描述。在一些类似 C 语言的编程语言中，花括号内的每一段代码都具有各自的作用域，而且变量在声明他们的代码段之外是不可见的，我们称为**块级作用域（block scope）**。在 ES5 中没有块级作用域，取而代之使用了**函数作用域（function scope）**，在 ES6 中，let 实际上为 JavaScript 新增了块级作用域。

```bash
    # demo 1 外层作用域无法读取内层作用域的变量
    {
        {
            {
                { { let insane = 'Hello World' }
                    console.log(insane); // ReferenceError: insane is not defined
                }
            }
        }
    };

    # demo 2 外层代码块不受内层代码块的影响
    # 如果两次都使用var定义变量n，最后输出的值才是10
    function func() {
        let n = 5;
        if (true) {
            let n = 10
        };
        console.log(n) // 5
    };
    func()

    # demo 3 块级作用域的出现，实际上使得获得广泛应用的立即执行函数表达式（IIFE）不再必要了。
    // IIFE 写法
    (function () {
        var tmp = ...;
        ...
    }());

    // 块级作用域写法
    {
        let tmp = ...;
        ...
    }
```

> **JavaScript 中的函数总是运行在他们被定义的作用域里，而不是他们被执行的作用域里。**

```bash
    var x = 10;

    function a() {
        console.log(x)
    };

    function b() {
        var x = 5;
        a()
    };

    b() // 10
```

作用域是 JavaScript 中比较重要的一个概念，很多 Js 部分的面试题都会围绕作用域展开，比如最常见的一个，**作用域链（scope chain）**。每一段 Js 代码（全局代码或函数）都有一个与之关联的作用域链，这个作用域链是一个对象列表或者链表，这组对象定义了这段代码“**作用域中**”的变量。在这里面，函数比较特殊，首先明确一点，**在 Js 里面，函数也是对象，**而且和其它对象一样，拥有可以通过代码访问的属性和一系列仅供 JavaScript 引擎访问的内部属性。其中一个内部属性是 `[[Scope]]`，该内部属性包含了函数被创建的作用域中对象的集合，这个集合被称为函数的作用域链，它决定了哪些数据能被函数访问。

对作用域链的理解是一个重点也是一个难点，在本文中很难尽述，关于作用域链还会涉及到其他一些知识点的理解，比如 with 语句修改作用域链和闭包的使用，关于这部分我会重新写一篇文章进行分析。上述就是在 ES5 中进行变量声明可能会遇到的一些麻烦以及 ES6 中做的相应处理，接下来我们看看 ES6 中还提供了哪些关于变量的新的特性。

# const 命令

const 声明一个只读的常量，一旦声明（且声明时必须同时进行赋值），常量的值就不能改变。const 的作用域与 let 命令相同：只在声明所在的块级作用域内有效；const 命令声明的常量也是不提升，同样存在暂时性死区，只能在声明的位置后面使用；const 声明的常量，也与 let 一样不可重复声明。

```bash
    # demo 1
    const PI = 3.1415;
    PI = 3; // TypeError: Assignment to constant variable.

    # demo 2
    const foo // SyntaxError: Missing initializer in const declaration
```

> const 实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。

我们知道，**JavaScript 中的数据类型分为两类：原始类型（primitive type）和对象类型（object type）**。对于包括数值、字符串和布尔值等在内的原始类型数据，值就保存在变量指向的那个内存地址里，因此等同于常量。但对于对象类型（也被称为复合类型）的数据（主要是对象和数组），变量所保存的是一个指向其内存地址的指针，const 只能保证这个指针是固定的，至于它指向的数据结构是不是可变的，就完全不能控制了。因此，将一个对象声明为常量必须非常小心。

# 关于顶层对象的讨论

> ES5 之中，顶层对象的属性与全局变量是等价的。顶层对象的属性与全局变量挂钩，被认为是 JavaScript 语言最大的设计败笔之一。

在浏览器 ES5 环境中，为了在不同的作用域内进行数据共享，我们经常会将共享的数据定义为全局变量或者定义为 window 对象的属性，在 ES5 中，这是完全等价的。关于顶层对象，在 ES5 中指的是 window 对象，在 Node 环境中指的是 global 对象。关于顶层对象的数据与全局变量等价，阮一峰在 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/let) 提到了这种设计的一些问题。

> 首先是没法在编译时就报出变量未声明的错误，只有运行时才能知道（因为全局变量可能是顶层对象的属性创造的，而属性的创造是动态的）；其次，程序员很容易不知不觉地就创建了全局变量（比如打字出错）；最后，顶层对象的属性是到处可以读写的，这非常不利于模块化编程。另一方面，window对象有实体含义，指的是浏览器的窗口对象，顶层对象是一个有实体含义的对象，也是不合适的。

关于顶层对象本身，在不同 Js 环境中表现也不一致。

-   浏览器里面，顶层对象是 window，但 Node 和 Web Worker 没有 window；
-   浏览器和 Web Worker 里面，self 也指向顶层对象，但是 Node 没有 self；
-   Node 里面，顶层对象是 global，但其他环境都不支持。

在 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/let) 中，阮一峰也给出了两种获取顶层对象**勉强可用**的方法和一个用来获取顶层对象的库 [System.global](https://github.com/ljharb/System.global)：

```bash
    // 方法一
    (typeof window !== 'undefined' ?
        window :
        (typeof process === 'object' &&
            typeof require === 'function' &&
            typeof global === 'object') ?
        global :
        this);

    // 方法二
    var getGlobal = function() {
        if (typeof self !== 'undefined') { return self; }
        if (typeof window !== 'undefined') { return window; }
        if (typeof global !== 'undefined') { return global; }
        throw new Error('unable to locate global object');
    };
```

ES5 只有两种声明变量的方法：var 命令和 function 命令。ES6 除了添加 let 和 const 命令，另外两种声明变量的方法：import 命令和 class 命令，加上 var 命令和 function 命令，ES6 一共定义了六种声明变量的方法。关于 import 命令和 class 命令的学习，我会在之后的文章中记录下来。

最后，对本文的内容做一下回顾和梳理。在本文中，为了更好的理解 let 命令和 const 命令，我首先对 ES5 中使用 var 关键字声明变量所存在的问题进行了罗列，包括 var 命令所引起的**变量提升、重复声明和作用域耦合**等，同时，针对性的对 ES6 中的应对方式做了说明。接着，我介绍了 ES6 中新增的用于进行常量定义的 const 命令，然后对顶层对象在不同 Js 环境中的不同表现做了说明。在本文中，大量引用和借鉴了阮一峰先生在 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/let) 一书中的观点，同时结合 _JavaScript权威指南_ 中的诸多内容和我自己的一些理解进行记录。正如我在文章开头所提到的，作为 Js 的基础知识，本文中的很多内容都有可能会在 Js 部分的面试题中出现，希望大家都可以掌握和理解。
