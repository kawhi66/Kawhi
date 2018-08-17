---
title: '【译】JavaScript Module Pattern: In-Depth'
date: 2018-07-19 11:01:48
tags: 译文
---
From [JavaScript Module Pattern: In-Depth](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)

# 关于作者

这篇文章记录在了作者的[博客](http://www.adequatelygood.com/)上面，可以看到是2010年写的，距离现在已经有快7个年头了，在准备本文的同时，我对博客的主人 [ben cherry](http://www.linkedin.com/in/bcherryprogrammer/)（也是本文的作者） 做了大致的了解。其实 Ben 现在已经没有在写多少 Js 了，他现在更多的是写 Ruby 和 Object-C。作者写这篇文章的时候应该是在 [Slide公司](http://www.linkedin.com/company/167696/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3B4mGHkShMS7GM7OWjQTLXUg%3D%3D&licu=urn%3Ali%3Acontrol%3Ad_flagship3_profile_view_base-background_details_company) 任职软件工程师。

***以下是译文部分***：

***

# 深入 Javascript 模块模式（模块化编程）

模块模式是一个通用的 Js 编程模式。大多数情况下易于理解，但有些高级的用法还没有能够得到足够的重视。在这篇文章中，我将对模块化编程的基础知识做回顾，并介绍一些值得关注的，包括一个我认为非常具有独创性的高级用法。

## 一、基础知识

我们将从模块模式的一个简单概述开始，从三年前 Eric Miraglia（来自YUI）第一次在[博客](https://yuiblog.com/blog/2007/06/12/module-pattern/)上记录开始，模块模式已经非常有名了。如果你对模块模式已经非常熟悉了，不妨跳到“高级模式”开始阅读。

### 1、匿名闭包函数

这是使得模块化编程成为可能的基础结构，而且实在是** Js 最好的一个特性**。我们所做的仅仅是创建一个匿名函数，然后立即去执行它。在匿名函数内部的所有代码都运行在一个**闭包**中，闭包在我们的应用运行的整个生命周期内提供了**隐蔽**和**状态**。

```bash
(function () {
    // 在这个作用域内的所有变量和函数仍然可以访问所有的全局变量
}());
```
注意包含有匿名函数的一对括号 `()` 。这是 Js 构造匿名函数必不可少的，因为以关键字 `function` 开始的声明语句总是会被看做是**函数声明**。定义在一对括号 `()` 内则仅仅是创建了一个**函数表达式**。

### 2、引入全局变量

Js 有一个著名的特性叫做**隐式全局变量**。无论何时使用一个变量名，Js 引擎总是会沿着作用域链向后寻找这个变量的声明语句。如果没有找到变量的声明语句，这个变量就会被假定为全局变量。如果给一个并不存在的变量直接赋值的话，事实上创建了一个全局变量。这就意味着在一个匿名的闭包函数中使用或创建全局变量是非常容易的。但不幸的是，这会使得代码难以管理，相比于将全局变量定义在一个单独的文件内，这样的特性使得全局变量对开发者而言不够清晰和直白。

幸运的是，我们的匿名函数提供了一个简单的替换方式。通过以参数的形式将全局变量传入匿名函数内，我们就可以将它们引入到我们的代码里面，这比隐式的声明全局变量更加**清晰**和**高效**。这是一个例子：

```bash
(function ($, YAHOO) {
    // 现在可以在这个作用域内访问全局变量 jQuery（以 $ 的形式）和 YAHOO
}(jQuery, YAHOO));
```

### 3、模块输出

有时候你并不仅仅是想*使用*全局变量，你还想声明他们。通过使用匿名函数的 `return value` 输出他们，我们可以容易的做到这一点。这种用法完善了基本的模块模式，这里是一个完整的例子：

```bash
var MODULE = (function () {
    var my = {}, privateVariable = 1;

    function privateMethod () {
        // ...
    };

    my.moduleProperty = 1;
    my.moduleMethod = function () {
        // ...
    };

    return my;
}())
```

注意我们声明了一个名为 `MODULE` 的全局模块，包含了两个公共的属性：一个名为 `MODULE.moduleMethod` 的方法和一个名为 `MODULE.moduleProperty` 的变量。另外，它还借助匿名的闭包函数维持了私有的内部状态。还有，通过之前介绍的模式，我们可以容易地引入任何需要的变量。

## 二、高级模式

尽管上面提到的已经可以满足大多数使用场景了，我们仍然可以进一步探索这种模式，创建一些非常强大的、可扩展的结构。我们一个一个来看一下，继续我们的名为 `MODULE` 的模块。

### 1、扩展

到目前为止，模块模式的局限性之一是整个模块必须写在一个文件内。任何在一个代码量庞大的项目中工作过的开发者都明白将代码分散到多个文件的价值。幸运的是，我们可以使用一个很好的方法来扩展模块。首先，我们引入这个模块，然后我们增加属性并再次导出这个模块。这里是一个例子，扩展了上面的 `MODULE` 模块：

```bash
var MODULE = (function (my) {
    my.anotherMethod = function () {
        // added method...
    };

    return my;
}(MODULE))
```

尽管不是必须的，为了一致性，我们再次使用了 `var` 关键字。这段代码运行时，我们的模块将增加一个新的公共方法 `MODULE.anotherMethod`。这个扩展文件也将保持所引入的模块和它自己私有的内部状态。

### 2、松耦合扩展

我们上面的例子中需要初始模块首先被创建，然后运行扩展模块，这并不是必须的。关于性能优化，Js 应用能够做的最好的事情之一是异步加载脚本。通过**松耦合扩展**模式，我们可以创建能够以任意顺序加载他们自己的灵活的多部件模块。每个文件都应该是如下的结构：

```bash
var MODULE = (function (my) {
    // add capabilities...
    
    return my;
}(MODULE || {}))
```

在这种模式中，`var` 关键字必不可少。注意如果模块不存在的话，在这里的引入将创建这个模块。这意味着你可以使用类似 **LABjs** 的工具来并行加载所有模块文件而不会引起阻塞。

### 3、紧耦合扩展

松耦合扩展是很好的，它突破了你的模块中的一些限制。但最重要的是，你无法安全的重写模块属性。你也无法在模块初始化时使用来自其他文件的模块属性（不过在初始化之后，你可以在运行期使用）。**紧耦合扩展**隐含了一系列的加载顺序，但允许**重写**。这里是一个简单的例子（扩展我们的原始 `MODULE`）：

```bash
var MODULE = (function (my) {
    var old_moduleMethod = my.moduleMethod;

    my.moduleMethod = function () {
        // 方法重写，但通过 old_moduleMethod 仍然可以使用原来的方法...
    };

    return my;
}(MODULE))
```

这里我们重写了 `MODULE.moduleMethod`，但仍然保留了一个原始方法的引用，当然如果需要的话。

### 4、克隆和继承

```bash
var MODULE_TWO = (function (old) {
    var my = {}, key;

    for (key in old) {
        if (old.hasOwnProperty(key)) {
            my[key] = old[key];
        }
    }

    var super_moduleMethod = old.moduleMethod;
    my.moduleMethod = function () {
        // 在克隆模块中重写方法，通过 super_moduleMethod 访问原始方法
    };

    return my;
}(MODULE));
```

这个模式也许是**最不灵活的选择**。它确实允许一些简洁的组合，但这是以灵活性为代价的。按照我写的，对象或函数属性将**不会**被复制，他们会像一个对象两个引用的形式出现。修改其中的任何一个，另一个也会被改变。如果是对象属性，可以使用递归克隆的方法解决这个问题，但如果是函数属性的话，除非使用 `eval`,否则可能很难解决。不过，为了完整性，我仍然把它包含了进来。

### 5、交叉的私有状态

将一个模块分散到多个文件内的一个严重的限制是每个文件都有自己私有的状态，并且无法访问其他文件的私有状态。这是可以解决的。这里有一个例子，一个松耦合扩展的模块在所有的扩展模块中保持私有状态。

```bash
var MODULE = (function (my) {
    var _private = my._private = my.private || {};
    var _seal = my._seal = my._seal || function () {
        delete my._private;
        delete my._seal;
        delete my._unseal;
    };
    var _unseal = my._unseal = my._unseal || function () {
        my._private = _private;
        my._seal = _seal;
        my._unseal = _unseal;
    };

    // 可以永久访问 _private, _seal 和 _unseal

    return my;
}(MODULE || {}));
```

任何文件都可以在它们各自的作用域中设置 `_private` 属性，并且将会立即对其他文件可见。一旦这个模块被完全加载，应用就应该调用 `MODULE._seal()` 方法阻止外部脚本访问内部的 `_private`。更近一步，在应用的生命周期中，如果这个模块再次被扩展，在任何文件中的一个内部方法都可以在加载新文件前调用 `_unseal()` 方法，在它被执行后调用 `_seal()` 方法。这种模式今天在我的工作中使用过，但在其他地方我很少见过。我认为这是一个非常有用的模式，就其本身而言，值得写下所有关于它的东西。

### 6、子模块

我们的最后一个高级模式其实是最简单的。有很多创建子模块的好的案例，就像创建一个普通的模块：

```bash
MODULE.sub = (function () {
    var my = {};
    // ...

    return my;
}());
```

尽管这已经很明显了，但我认为这种模式值得被包括进来。子模块具有普通模块所有的高级特性，包括扩展和私有状态。

## 三、总结

大部分高级模式可以相互组合创建更有用的模式。如果一定要选择一个组合去设计一个复杂的应用的话，我会组合**松耦合扩展**、**私有状态**和**子模块**。

本文中我并未提及过性能优化，但我想把它总结为一句话：模块模式**表现很好**。它可以很好的缩小化，使得代码下载更快。通过松耦合扩展模式很简单的就可以做到并行下载，也可以加快下载速度。初始化的时间相比其他方法可能要慢一点儿，但这是完全值得的。只要全局变量可以被正确的引入，运行时的性能表现应该不会受到影响，通过在子模块中使用局部变量缩短作用域链很可能会进一步加快速度。

为了结束本文，这里有一个关于子模块的例子，它可以动态加载到它的父模块（如果父模块不存在的话会创建一个父模块）中。为简单起见我先不讨论私有状态，但把它包括进来应该是很简单的。这种编码模式允许一整个复杂的分级代码基完全地并行加载它自身、子模块和其他所有的脚本。

```bash
var UTIL = (function (parent, $) {
    var my = parent.ajax = parent.ajax || {};

    my.get = function (url, params, callback) {
        // 好吧，我作弊了:)
        return $.getJSON(url, params, callback);
    };

    // 等等...

    return parent;
}(UTIL || {}, jQuery));
```

我希望这会有用，请留下你的评论来分享你的想法。现在，继续前进去写更好的，更加模块化的 Js 吧！

注：*这篇文章刊登在 [Ajaxian.com](http://ajaxian.com/archives/a-deep-dive-and-analysis-of-the-javascript-module-pattern) 上，这里也有一些关于它的很好的讨论，也很值得去阅读。*




***以下是原文部分***：

***

# JavaScript Module Pattern: In-Depth

The module pattern is a common JavaScript coding pattern. It's generally well understood, but there are a number of advanced uses that have not gotten a lot of attention. In this article, I'll review the basics and cover some truly remarkable advanced topics, including one which I think is original.

## The Basics

We'll start out with a simple overview of the module pattern, which has been well-known since Eric Miraglia (of YUI) first blogged about it three years ago. If you're already familiar with the module pattern, feel free to skip ahead to "Advanced Patterns".

### Anonymous Closures

This is the fundamental construct that makes it all possible, and really is the single best feature of JavaScript. We'll simply create an anonymous function, and execute it immediately. All of the code that runs inside the function lives in a closure, which provides privacy and state throughout the lifetime of our application.

```bash
(function () {
    // ... all vars and functions are in this scope only
    // still maintains access to all globals
}());
```

Notice the () around the anonymous function. This is required by the language, since statements that begin with the token function are always considered to be function declarations. Including () creates a function expression instead.

### Global Import

JavaScript has a feature known as implied globals. Whenever a name is used, the interpreter walks the scope chain backwards looking for a var statement for that name. If none is found, that variable is assumed to be global. If it's used in an assignment, the global is created if it doesn't already exist. This means that using or creating global variables in an anonymous closure is easy. Unfortunately, this leads to hard-to-manage code, as it's not obvious (to humans) which variables are global in a given file.

Luckily, our anonymous function provides an easy alternative. By passing globals as parameters to our anonymous function, we import them into our code, which is both clearer and faster than implied globals. Here's an example:

```bash
(function ($, YAHOO) {
    // now have access to globals jQuery (as $) and YAHOO in this code
}(jQuery, YAHOO));
```

### Module Export

Sometimes you don't just want to use globals, but you want to declare them. We can easily do this by exporting them, using the anonymous function's return value. Doing so will complete the basic module pattern, so here's a complete example:

```bash
var MODULE = (function () {
    var my = {},
    privateVariable = 1;

    function privateMethod() {
        // ...
    }

    my.moduleProperty = 1;
    my.moduleMethod = function () {
        // ...
    };

    return my;
}());
```

Notice that we've declared a global module named MODULE, with two public properties: a method named MODULE.moduleMethod and a variable named MODULE.moduleProperty. In addition, it maintains private internal state using the closure of the anonymous function. Also, we can easily import needed globals, using the pattern we learned above.

## Advanced Patterns

While the above is enough for many uses, we can take this pattern farther and create some very powerful, extensible constructs. Lets work through them one-by-one, continuing with our module named MODULE.

### Augmentation

One limitation of the module pattern so far is that the entire module must be in one file. Anyone who has worked in a large code-base understands the value of splitting among multiple files. Luckily, we have a nice solution to augment modules. First, we import the module, then we add properties, then we export it. Here's an example, augmenting our MODULE from above:

```bash
var MODULE = (function (my) {
    my.anotherMethod = function () {
        // added method...
    };

    return my;
}(MODULE));
```

We use the var keyword again for consistency, even though it's not necessary. After this code has run, our module will have gained a new public method named MODULE.anotherMethod. This augmentation file will also maintain its own private internal state and imports.

### Loose Augmentation

While our example above requires our initial module creation to be first, and the augmentation to happen second, that isn't always necessary. One of the best things a JavaScript application can do for performance is to load scripts asynchronously. We can create flexible multi-part modules that can load themselves in any order with loose augmentation. Each file should have the following structure:

```bash
var MODULE = (function (my) {
    // add capabilities...

    return my;
}(MODULE || {}));
```

In this pattern, the var statement is always necessary. Note that the import will create the module if it does not already exist. This means you can use a tool like LABjs and load all of your module files in parallel, without needing to block.

### Tight Augmentation

While loose augmentation is great, it does place some limitations on your module. Most importantly, you cannot override module properties safely. You also cannot use module properties from other files during initialization (but you can at run-time after intialization). Tight augmentation implies a set loading order, but allows overrides. Here is a simple example (augmenting our original MODULE):

```bash
var MODULE = (function (my) {
    var old_moduleMethod = my.moduleMethod;

    my.moduleMethod = function () {
        // method override, has access to old through old_moduleMethod...
    };

    return my;
}(MODULE));
```

Here we've overridden MODULE.moduleMethod, but maintain a reference to the original method, if needed.

### Cloning and Inheritance

```bash
var MODULE_TWO = (function (old) {
    var my = {},
        key;

    for (key in old) {
        if (old.hasOwnProperty(key)) {
            my[key] = old[key];
        }
    }

    var super_moduleMethod = old.moduleMethod;
    my.moduleMethod = function () {
        // override method on the clone, access to super through super_moduleMethod
    };

    return my;
}(MODULE));
```

This pattern is perhaps the least flexible option. It does allow some neat compositions, but that comes at the expense of flexibility. As I've written it, properties which are objects or functions will not be duplicated, they will exist as one object with two references. Changing one will change the other. This could be fixed for objects with a recursive cloning process, but probably cannot be fixed for functions, except perhaps with eval. Nevertheless, I've included it for completeness.

### Cross-File Private State

One severe limitation of splitting a module across multiple files is that each file maintains its own private state, and does not get access to the private state of the other files. This can be fixed. Here is an example of a loosely augmented module that will maintain private state across all augmentations:

```bash
var MODULE = (function (my) {
    var _private = my._private = my._private || {},
        _seal = my._seal = my._seal || function () {
            delete my._private;
            delete my._seal;
            delete my._unseal;
        },
        _unseal = my._unseal = my._unseal || function () {
            my._private = _private;
            my._seal = _seal;
            my._unseal = _unseal;
        };

    // permanent access to _private, _seal, and _unseal
    return my;
}(MODULE || {}));
```

Any file can set properties on their local variable `_private`, and it will be immediately available to the others. Once this module has loaded completely, the application should call `MODULE._seal()`, which will prevent external access to the internal `_private`. If this module were to be augmented again, further in the application's lifetime, one of the internal methods, in any file, can call `_unseal()` before loading the new file, and call `_seal()` again after it has been executed. This pattern occurred to me today while I was at work, I have not seen this elsewhere. I think this is a very useful pattern, and would have been worth writing about all on its own.

### Sub-modules

Our final advanced pattern is actually the simplest. There are many good cases for creating sub-modules. It is just like creating regular modules:

```bash
MODULE.sub = (function () {
    var my = {};
    // ...

    return my;
}());
```

While this may have been obvious, I thought it worth including. Sub-modules have all the advanced capabilities of normal modules, including augmentation and private state.

## Conclusions

Most of the advanced patterns can be combined with each other to create more useful patterns. If I had to advocate a route to take in designing a complex application, I'd combine loose augmentation, private state, and sub-modules.

I haven't touched on performance here at all, but I'd like to put in one quick note: The module pattern is good for performance. It minifies really well, which makes downloading the code faster. Using loose augmentation allows easy non-blocking parallel downloads, which also speeds up download speeds. Initialization time is probably a bit slower than other methods, but worth the trade-off. Run-time performance should suffer no penalties so long as globals are imported correctly, and will probably gain speed in sub-modules by shortening the reference chain with local variables.

To close, here's an example of a sub-module that loads itself dynamically to its parent (creating it if it does not exist). I've left out private state for brevity, but including it would be simple. This code pattern allows an entire complex heirarchical code-base to be loaded completely in parallel with itself, sub-modules and all.

```bash
var UTIL = (function (parent, $) {
    var my = parent.ajax = parent.ajax || {};

    my.get = function (url, params, callback) {
        // ok, so I'm cheating a bit :)
        return $.getJSON(url, params, callback);
    };

    // etc...

    return parent;
}(UTIL || {}, jQuery));
```

I hope this has been useful, and please leave a comment to share your thoughts. Now, go forth and write better, more modular JavaScript!

This post was [featured on Ajaxian.com](http://ajaxian.com/archives/a-deep-dive-and-analysis-of-the-javascript-module-pattern), and there is a little bit more discussion going on there as well, which is worth reading in addition to the comments below.