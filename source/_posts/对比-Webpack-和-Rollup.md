---
title: 对比 Webpack 和 Rollup
date: 2019-05-15 10:59:10
tags: 前端工程化
---

工作当中用到最多的是 Webpack，事实上，由于种种原因，对公司内部大多数 Web 项目来说，Webpack 几乎是唯一的选择。[next-wrapper](https://www.npmjs.com/package/next-wrapper) 的最终输出物是一个 JavaScript 库，我试图使它在 Node 环境和浏览器环境下都可以使用，我最初尝试用 Webpack 打包，但打出的包在 Node 环境下无法运行。Rollup 很好的解决了我的问题，通过 Rollup 可以轻松地打出支持不同模块规范的包。在大多数涉及到 Webpack 和 Rollup 的讨论中，_Use webpack for apps, and Rollup for libraries_ 成为了众多开发者的共识，本文对 Webpack 和 Rollup 的特点和使用场景做了较深入的分析对比，以便更好的理解和应用这两个模块打包工具。

_注：本文涉及到的 Webpack 和 Rollup 均为当前的最新版，即 Webpack V4.31.0 和 Rollup V1.12.0。_

# 配置文件的对比

在测试项目中，我试图通过 Webpack 和 Rollup 分别将名为 `test-build.js` 的一个简单的模块文件打包到 `test-build` 目录下，它以 ES 模块规范导出了一个固定值，并且打包结果应该支持实现 CommonJS 规范的运行环境（这里特指 Node 环境）。`test-build.js` 内容如下：

```JavaScript
export default 100
```

Rollup 的配置文件 `rollup.config.js` 内容如下：

```JavaScript
export default {
    input: 'test-build.js',
    output: {
        file: 'test-build/rollup.js',
        format: 'cjs',
        name: 'testBuild'
    }
}
```

Webpack 的配置文件 `webpack.config.js` 内容如下：

```JavaScript
const path = require('path')
module.exports = {
    mode: 'development',
    entry: './test-build.js',
    output: {
        filename: 'webpack.js',
        library: 'testBuild',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'test-build')
    }
}
```

不难看出，对 JavaScript 库的构建和打包，从配置文件来看，两者差别不大。只是：

-   由于 Rollup 对 ES 模块规范的支持，以 ES 模块规范定义的配置文件也可以完美的解析和运行。反之，尽管 Webpack 可以支持 `export default 100` 这种 ES 规范的模块导出方式，但如果配置文件也使用 ES 模块规范的导出方式则会在打包时报语法错误 `SyntaxError: Unexpected token export`。
-   Rollup 支持 `test-build/rollup.js` 这种**相对路径**的 `file` 定义方式，而 Webpack 推荐（只支持）以**绝对路径**来定义 `path` 打包路径。

# 打包结果的对比

Rollup 的打包结果与源码差别不大，事实上，即便源码内容再复杂，打包结果与源码的差别也非常类似。Rollup 的打包结果如下：

```JavaScript
'use strict';

var testBuild = 100;

module.exports = testBuild;
```

而 Webpack 的打包结果与源码的差别就比较大了，限于篇幅，这里只摘取了一段（未摘出的部分其实是 `__webpack_require__` 方法的实现），结果如下：

```JavaScript
/***/ "./test-build.js":
/*!***********************!*\
  !*** ./test-build.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (100);\n\n\n//# sourceURL=webpack://testBuild/./test-build.js?");

/***/ })
```

总体上来讲，Rollup 的打包结果无论从可读性，还是文件体积都有明显的优势。有[文章](http://www.ayqy.net/blog/%E4%BB%8Ewebpack%E5%88%B0rollup/)还指出，`__webpack_require__` 在执行时效率不高，因而就打包结果来说，Rollup 的处理要更好一些。

# 特性对比

·
Webpack 和 Rollup 两者的历史渊源，我没有深究，不过早在两年前（2017 年）就有[文章](http://www.ayqy.net/blog/%E4%BB%8Ewebpack%E5%88%B0rollup/)提出要放弃 Webpack。关于两者的特性对比，我还没有想到好的方法去做实践对比，如果要完全搞清楚，也许要深入到源码层面。我看过的关于两者对比的文章（[Webpack and Rollup: the same but different](https://medium.com/webpack/webpack-and-rollup-the-same-but-different-a41ad427058c)（这篇文章是由 Rollup 的作者 [Rich Harris](https://medium.com/@Rich_Harris?source=user_popover) 本人写的），[Rollup vs Webpack](https://medium.com/jsdownunder/rollup-vs-webpack-javascript-bundling-in-2018-b35758a2268)，[Webpack vs Rollup](https://blog.csdn.net/wangyiyungw/article/details/84955909)（这是国内的开发者写的一篇文章））观点基本是一致的：

## Webpack 的优势

-   代码分块（Code-splitting）
-   静态资源（Static assets）
-   模块热更新（Hot module replacement）
-   插件和生态圈（Plugins and ecosystem）

## Rollup 的优势

-   代码优化（Tree shaking / live code inclusion / dead code elimination）
-   ES 模块规范的原生支持和丰富的模块规范支持（ESNext native support and more）
-   简介的 API （Simple API）

# 使用场景对比

> Use webpack for apps, and Rollup for libraries

Rollup 的作者 [Rich Harris](https://medium.com/@Rich_Harris?source=user_popover) 在 2017 年的文章 [Webpack and Rollup: the same but different](https://medium.com/webpack/webpack-and-rollup-the-same-but-different-a41ad427058c) 中提到了这个观点，它几乎成为了众多开发者公认的最佳应用实践，很多主流的 JavaScript 库也都在这么用。

需要注意的是，这并不是一个绝对的规则，[Rich Harris](https://medium.com/@Rich_Harris?source=user_popover) 是这么说的：

> If you need code-splitting, or you have lots of static assets, or you’re building something with lots of CommonJS dependencies, Webpack is a better choice. If your codebase is ES2015 modules and you’re making something to be used by other people, you probably want Rollup.

如果你需要代码分块，或者有很多的静态资源，又或者你正在构建的东西用到了大量的 CommonJS 规范的模块依赖，webpack 是一个更好的选择。如果你的代码符合 ES2015 模块规范，而且想要它可以被其他人使用，你也许应该选择 rollup。
