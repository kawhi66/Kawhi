---
title: ECMAScript 2015(ES6)：import 和 export 命令
date: 2018-07-11 11:10:39
tags: ES6
---
记录前端的模块化。

# 前端模块化

> 上学的时候，我就很喜欢历史，不止为了考高分，是很着迷。直到现在，我仍然很喜欢依据真实史实所拍摄的影视作品。

前端是什么时候开始流行模块化的，我不知道，我大概也没有经历过。当 [Brendan Eich](https://brendaneich.com/ "Brendan Eich") 用不到10天的时间写完 JavaScript 的时候，我可能还不会走路。不过，有很多经历过或研究过的开发者已经记录过了，而且还有了很多的革新，比如来自[玉伯](https://github.com/lifesinger "玉伯")的 [Sea.js](https://seajs.github.io/seajs/ "Sea.js")。

通过学习和研究前辈的作品，我大概知道了些前端模块化的端倪以及ES6模块化特性的出处。本文重点在于ES6模块化语法的学习和使用，因此关于前端模块化的历史和原由不会详述。我提供给大家一些资料（除了玉伯的 [Sea.js](https://seajs.github.io/seajs/ "Sea.js")，其实这里已经覆盖了很多了），我所知的大概也都是从这些资料中来的：

* [前端模块化开发那点历史 —— 玉伯](https://github.com/seajs/seajs/issues/588)
* [js模块化历程 —— 吕大豹](http://www.cnblogs.com/lvdabao/p/js-modules-develop.html)
* [JavaScript模块化七日谈 —— 黄玄](http://huangxuan.me/js-module-7day)
* [Javascript模块化编程 —— 阮一峰](http://www.ruanyifeng.com/blog/2012/10/javascript_module.html)
* [JavaScript Module Pattern: In-Depth" —— ben cherry](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)

在 Ajax 出现以前，JavaScript 最初的形态只是在网页上执行简单交互的辅助性脚本语言。随着代码量的增加和业务的复杂，简单的基于函数做功能分割已经无法满足需求，所以，社区开发者开始了 JavaScript 的模块化实践。JavaScript 模块化需要解决的两个关键问题是**命名冲突**和**文件依赖**，伴随着这两个主题，开发者开始尝试定义唯一的全局对象和闭包（IIFE）。当 NodeJs 在服务端取得成功之后，Common.js 开始走入开发者的视野，基于 Common.js，相继又出现了 MODULES/1.0，AMD/CMD，Sea.js，Browserify，Webpack。目前，基于 Browserify 或者 Webpack 完成模块的编译（包括合并，压缩和混淆等）和加载已经变得非常流行，在很大程度上也确实可以解决我们项目中的很多问题。

# RequireJs(AMD) 和 SeaJs(CMD)

之前就做过研究，但其实在项目中没怎么用过，现在的项目一直在用 ES6 实现模块化，用 webpack + babel 做构建和打包。不过已经有很多开发者讨论过这个话题：

* [与 RequireJS 的异同 —— 玉伯](https://github.com/seajs/seajs/issues/277)
* [AMD 和 CMD 的区别有哪些？—— 知乎](https://www.zhihu.com/question/20351507/answer/14859415)
* [SeaJS 与 RequireJS 最大的区别](https://www.douban.com/note/283566440/)

讲真，我写不出什么来了，它们都很优秀（否则不会有这么多的讨论），如果真的要深究，就要深入到代码层面，于本文关联度不大（其实我觉得应该做这个事情，之后我会针对 Sea.js 做重点研究，因为它更方便些，不用翻墙去找答案）。为了本文的完整，在这里对二者的区别做个介绍（请注意，这部分内容不是原创，但应该是比较重要的，很多的面试都会提到这个问题）。

## 相同之处

> RequireJS 和 Sea.js 都是模块加载器，倡导模块化开发理念，核心价值是让 JavaScript 的模块化开发变得简单自然。

## 不同之处

### 宏观层面

+ **定位有差异**。 RequireJS 想成为浏览器端的模块加载器，同时也想成为 Rhino/Node 等环境的模块加载器。Sea.js 则专注于 Web 浏览器端，同时通过 Node 扩展的方式可以很方便跑在 Node 环境中。
+ **遵循的规范不同**。 RequireJS 遵循 AMD （异步模块定义）规范，Sea.js 遵循 CMD （通用模块定义）规范。规范的不同，导致了两者 API 不同。Sea.js 更贴近 CommonJS Modules/1.1 和 Node Modules 规范。
+ **推广理念有差异**。 RequireJS 尝试让第三方类库修改自身来支持 RequireJS，目前只有少数社区采纳。Sea.js 不强推，采用自主封装的方式来“海纳百川”，目前已有较成熟的封装策略。
+ **对开发调试的支持有差异**。 Sea.js 非常关注代码的开发调试，有 nocache、debug 等用于调试的插件。RequireJS 无这方面的明显支持。
+ **插件机制不同**。 RequireJS 采取的是在源码中预留接口的形式，插件类型比较单一。 Sea.js 采取的是通用事件机制，插件类型更丰富。

### 实现方式

+ 对于依赖的模块，AMD 是**提前执行**，CMD 是**延迟执行**。不过 RequireJS 从 2.0 开始，也改成可以延迟执行（根据写法不同，处理方式不同）。 CMD 推崇 as lazy as possible。
+ CMD 推崇**依赖就近**，AMD 推崇**依赖前置**。虽然 AMD 也支持 CMD 的写法，同时还支持将 require 作为依赖项传递，但 RequireJS 的作者一般还是推崇的写法，也是官方文档里默认的模块定义写法。

``` bash
    // CMD 依赖就近的写法
    define(function(require, exports, module) {
        var a = require('./a')
        a.doSomething()
        ... // 此次省略100行
        var b = require('./b') // 依赖可以就近书写
        b.doSomething()
    });

    // AMD 默认推荐的是
    define(['./a', './b'], function(a, b) {  // 依赖必须一开始就写好
        a.doSomething()
        ... // 此处略去 100 行
        b.doSomething()
    });
```

+ **AMD 的 API 默认是一个当多个用，CMD 的 API 严格区分，推崇职责单一**。比如 AMD 里，require 分全局 require 和局部 require，都叫 require。 CMD 里，没有全局 require，而是根据模块系统的完备性，提供 seajs.use 来实现模块系统的加载启动。 CMD 里，每个 API 都简单纯粹。

# ES6模块化特性实现

> ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

当社区的开发者对 AMD 和 CMD 喋喋不休的争论时，ES6 就来一统天下了。 ES6 模块的设计思想，是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。模块功能主要由两个命令构成：export 和 import。 export 命令用于规定模块的对外接口，import 命令用于输入其他模块提供的功能。

## export

在模块内部涉及到的所有项对外都是不可见的，以往我们需要使用闭包来完成的**信息隐藏**的功能在 ES6 中仅需要定义在相应的模块文件中即可。在 ES6 中，模块通过 `export` 关键字对外提供接口，`export` 的用法主要有下面两种形式：

``` bash
    // module: profile.js 
    # 使用 export 命令对外输出三个变量
    export var firstName = 'Michael';
    export var lastName = 'Jackson';
    export var year = 1958;

    # 在 export 命令后面，使用大括号指定所要输出的一组变量。
    var firstName = 'Michael';
    var lastName = 'Jackson';
    var year = 1958;
    export {firstName, lastName, year};
```

上面两种形式是完全等价的，但是推荐优先考虑第二种形式。将模块需要对外暴露的接口定义在模块尾部，开发者可以一眼看出，方便模块的维护和调用。`export` 命令除了输出变量，还可以输出函数或类（`class`）：

``` bash
    export let add = function(a, b){
        return a + b;
    }

    export function multiply(x, y) {
        return x * y;
    }
```

通常情况下，`export` 输出的变量就是本来的名字，但是可以使用 `as` 关键字重命名：

``` bash
    function v1() { ... }
    function v2() { ... }

    export {
        v1 as streamV1,
        v2 as streamV2,
        v2 as streamLatestVersion
    };
```

需要特别注意的是，**export命令规定的是对外的接口，必须与模块内部的变量建立一一对应关系**。

``` bash
    // 两种错误的输出方式
    export 1;

    var m = 1;
    export m;
```

上面这两种写法都是错的，因为没有提供对外的接口。第一种写法直接输出1，第二种写法通过变量 m 输出的还是1。正确的写法是：

``` bash
    export var m = 1;

    var m = 1;
    export {m};
    export {m as n};
```

另外，`export` 语句输出的接口，**与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值**。这一点与 CommonJS 规范完全不同。 CommonJS 模块输出的是值的缓存，不存在动态更新。最后，`export` 命令**可以出现在模块的任何位置，只要处于模块顶层就可以**。如果处于块级作用域内，就会报错，import命令也是如此。这是因为处于条件代码块之中，就没法做静态优化了，违背了ES6模块的设计初衷。

``` bash
    // export命令放在块级作用域内报错
    function foo() {
        export default 'bar' // SyntaxError
    };

    foo()
```

## import

`import` 命令用于在模块中加载依赖和定义变量。 该命令接受一对大括号，里面指定要从其他模块导入的变量名。大括号里面的变量名，必须与被导入模块对外接口的名称相同。

``` bash
    // 从同目录下的 profile.js 中加载 firstName、lastName 和 year
    import {firstName, lastName, year} from './profile';

    function setName(element) {
        element.textContent = firstName + ' ' + lastName;
    }
```

`import` 命令也支持使用 `as` 关键字重新命名变量。

``` bash
    import { lastName as surname } from './profile';
```

**除了在加载时指定要从其他模块导入的变量名，`import` 命令也可以使用通配符 `*`，结合 `as` 关键字实现整体加载。**

``` bash
    // module es6.js
    const name = "zuoyan1949";
    let a = 1;

    export const add = function(a, b) {
        return a + b
    };

    export {name, a};

    // main.js
    import * as bar from "./es6";
    console.log(bar); // {add: [Function: add], name: 'zuoyan1949', a: 1}
```

注：关于模块整体加载后的对象（上例是`bar`）修改，在 [ECMAScript 6 入门——Module的语法](http://es6.ruanyifeng.com/#docs/module#%E6%A8%A1%E5%9D%97%E7%9A%84%E6%95%B4%E4%BD%93%E5%8A%A0%E8%BD%BD) 中记载是不允许再修改的，但我在 Node 环境中运行时是可以修改，并不会报错，修改之后，`bar` 会变为修改后的值。但正如书中所述，ES6 模块实现的理念之一即是静态分析的优化，因此我们在代码中应该尽量避免这样的修改。

`import` 后面的 `from` 指定模块文件的位置，可以是相对路径，也可以是绝对路径，`.js` 后缀可以省略。如果只是模块名，不带有路径，那么必须有配置文件，告诉 JavaScript 引擎该模块的位置。注意，**`import` 命令具有提升效果，会提升到整个模块的头部，首先执行。**

``` bash
    // 由于import命令的提升作用，这段代码并不会报错
    foo();

    import { foo } from 'my_module';
```

`import` 命令的提升行为的本质是：**`import` 命令是编译阶段执行的，在代码运行之前**。由于 `import` 是静态执行，所以**不能使用表达式和变量**，这些只有在运行时才能得到结果的语法结构（如表达式、变量和if结构等），下面的三种写法都会报错：

``` bash
    import { 'f' + 'oo' } from 'my_module'; // 报错

    let module = 'my_module';
    import { foo } from module; // 报错

    if (x === 1) {
        import { foo } from 'module1'; // 报错
    } else {
        import { foo } from 'module2'; // 报错
    }
```

**`import` 命令会执行所加载的模块，但多次重复加载同一个模块，只会执行一次**。

``` bash
    // 这段代码加载了两次lodash模块，但只会执行一次
    import "lodash"
    import "lodash"

    // 这段代码中，虽然foo和bar在两个语句中加载，但是它们对应的是同一个my_module实例。
    import { foo } from 'my_module';
    import { bar } from 'my_module';

    // 等同于
    import { foo, bar } from 'my_module';
```

目前阶段，通过 Babel 转码，CommonJS 模块的 `require` 命令和 ES6 模块的 `import` 命令，可以写在同一个模块里面，但是最好不要这样做。因为 `import` 在静态解析阶段执行，所以它是一个模块之中最早执行的。

## import 和 export 还能这么用

到目前为止，我们已经知道，无论是通过 `export` 命令暴露模块对外接口，亦或是通过 `import` 命令加载依赖模块变量，都需要将其以对象的形式包含在一对大括号 `{}` 内（模块的整体加载其实也是定义在了整体加载的对象之内，本质是一样的）。如果对于一个对外开放的模块来说，如果不通过模块文档或者模块注释，开发者调用的时候很难了解被依赖的模块究竟暴露了哪些可以调用的接口，这时候，在模块定义时指定默认输出就很有必要了。在 ES6 中，可以使用 `export default` 指定模块的默认输出。

``` bash
    // 通过 export default 指定模块的默认输出
    export default function () {
        console.log('foo')
    }

    // 其他模块加载该模块时，import命令可以为该匿名函数**指定任意名字**。
    import customName from './export-default';
    customName(); // 'foo'
```

上例中默认输出的是一个匿名函数，事实上，`export default` 也可以用来默认输出非匿名函数。此时，函数名在模块外部是无效的，作为依赖加载时，视同匿名函数。下面比较一下默认输出和正常输出：

``` bash
    // 默认输出
    export default function crc32() {
        // ...
    }

    // 默认输入
    import crc32 from 'crc32';

    // 正常输出
    export function crc32() {
        // ...
    };

    // 正常输入
    import {crc32} from 'crc32';
```

**显然，一个模块只能有一个默认输出，因此 `export default` 命令只能使用一次。所以，`import` 命令后面才不用加大括号，因为只可能对应一个方法。本质上，`export default` 就是输出一个叫做 `default` 的变量或方法，然后系统允许你为它取任意名字。注意，在使用 `import *`命令进行整体加载时会忽略模块的默认输出，因此，当需要加载包含有默认输出的模块依赖时，除了使用 `import *` 命令加载正常接口外，还需额外引入默认接口。**

正是因为 `export default` 命令其实只是输出一个叫做 `default` 的变量，所以可以直接在后面写一个值，但不能再跟变量声明语句。

``` bash
    // 正确
    export default 42;

    // 正确
    export var a = 1;

    // 正确
    var a = 1;
    export default a;

    // 报错
    export 42;
    export default var a = 1;
```

在一个模块中，只允许指定一个默认输出，即只允许出现一条 `export default` 命令，如果需要同时指定默认输出和其他接口，模块定义时应该这样写：

``` bash
    # lodash.js
    // 指定默认接口
    export default function (obj) {
        // ···
    }

    // 暴露each接口
    export function each(obj, iterator, context) {
        // ···
    }

    // 暴露出forEach接口，默认指向each接口，即forEach和each指向同一个方法。
    export { each as forEach };
```

加载上述模块时，对应的 `import` 语句可以是：`import _, { each, each as forEach } from 'lodash';`。

**关于 `export` 命令和 `import` 命令的复合写法**，在 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/module#export-%E4%B8%8E-import-%E7%9A%84%E5%A4%8D%E5%90%88%E5%86%99%E6%B3%95) 中有详细记载，但我认为，复合写法的使用应该出现在真正需要的场景下（我还没有想到），这部分内容本文不再展开。

# 延伸

## 注释

我们可以有很多的标准来评估一段代码的好与坏，注释一定是其中之一。作为一个对外开放的，可复用的功能模块，注释必不可少。遗憾的是，在写本文的同时，当我尝试找一些关于 ES6 模块注释规范的资料时，几乎一无所获。其实，关于 JavaScript 的注释规范是有的，在 ES6 之前，JavaScript 并没有模块的概念，所以，JavaScript 的注释规范中关于模块的要求很少，我参考 Java 的类模块注释模板，介绍一种针对 ES6 模块的注释模板。

``` bash
    /**
     * Module Description: a demo
     *  
     * @author: kawhi
     * @contact: kawhi.site@qq.com
     * @date: Wed, Nov 08, 2017
     * @version: V1.0.0
     *  
     * @dependencies:
     * module 1
     * module 2
     * ...
     * 
     * @export default:
     * ...
     * 
     * @export:
     * variable 1: description
     * variable 2: description
     * variable 3: description
     * ...
     * 
     *  Version       Date        ModifiedBy            Content  
     * ---------   ----------   --------------   ------------------------
     * 1.0.0
     * 
     **/
```

模板由几个部分组成，包括模块描述、创建信息、模块依赖、默认接口、普通接口以及更新记录。不用深入源码，开发者仅通过模块注释即可了解模块所实现的功能和对外暴露的接口，一目了然。上述模板中有些信息非必填项，比如更新记录，可以根据实际情况填写。

## 继承

> 继承指的是一个类从另一个类中获得属性和方法的过程，被继承的类称为父类，继承的类称为子类。

与 Java 或 C++ 一样，JavaScript 也是面向对象的编程语言（尽管它的实现方式不太容易接受）。继承是面向对象的三大特性之一，在 JavaScript 里实现继承的方式有多种，在这里我们讨论的是关于 ES6 模块的继承。模块可以被继承，如果按照上述对于继承的定义来看，尽管在 ES6 中，模块并不是类，但模块可以用来引入或输出一个类，当一个模块将其依赖的某个模块中的属性或方法不做修改，原样输出的时候，我们就可以认为发生了继承。一个继承自 `circle.js` 的模块 `circleplus.js` 可以是这样的：

``` bash
    // 继承来自circle的所有的非默认接口
    export * from 'circle';
    export var e = 2.71828182846;
    export default function(x) {
        return Math.exp(x);
    }

    // 只继承某个接口
    export { area as circleArea } from 'circle';
```

## 数据共享（跨模块常量）

我们知道，一个模块应该是一个独立的，可复用的业务单元。如果不通过 `export` 命令对外输出，模块内的任何项对外都是不可见的，如果我们想在模块间共享数据（这样的需求场景应该不能想象）怎么办？上节中的模块继承可以给我们启发，我们可以尝试将被共享的数据定义在同一个模块中对外输出，然后在其他模块中继承或依赖即可。

``` bash
    # 位于同一个目录下的静态变量被合并在了 index.js 模块中对外输出

    // constants/db.js
    export const db = {
        url: 'http://my.couchdbserver.local:5984',
        admin_username: 'admin',
        admin_password: 'admin password'
    };

    // constants/user.js
    export const users = ['root', 'admin', 'staff', 'ceo', 'chief', 'moderator'];

    // constants/index.js
    export {db} from './db';
    export {users} from './users';

    # 使用的时候，直接加载index.js就可以了。
    import {db, users} from './index';
```

## 运行时加载（关于import()的一个提案）

> 脚本执行有两个阶段，脚本加载（静态分析）和实际执行。 import 在脚本加载阶段就生效，但是不执行。

在 [ECMAScript 6 入门](http://es6.ruanyifeng.com/) 中关于 JavaScript 脚本执行介绍的不多，前面讲到关于静态分析时还不太理解。阮一峰在 [关于Module的问题](https://github.com/ruanyf/es6tutorial/issues/321) 这个 issue 上做了说明。这样就可以理解为什么 `export` 和 `import` 命令不能放在块作用域内了，但如果我们有这样的需求时怎么办？ `require` 命令是可以实现的，因为它是在运行时加载的，目前已经有一个 [提案](https://github.com/tc39/proposal-dynamic-import) 是关于使用 `import()` 方法实现运行时加载。这部分本文不再展开，如果有兴趣可以参考所给链接。

# 总结

写到这里，其实本文所讲的已经不仅仅是关于 `export` 和 `import` 命令的使用了。本文大量借用了参考了 [ECMAScript 6 入门](http://es6.ruanyifeng.com/) 中的内容，还有来自其他开发者的博客内容。从前端模块化的进程开始，本文首先对基于 AMD 和 CMD 的两种模块化实现方式做了简单介绍，接着对 ES6 中模块化的特性和实现做了详细的介绍，在最后一部分关于模块化特性的使用做了延伸。最后，再次强调，本文中涉及的诸多内容都可能在前端面试中的 JavaScript 部分出现，愿有所裨益。