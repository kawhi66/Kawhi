---
title: 译：Frequently Asked Questions About Rollup
date: 2019-05-14 10:26:01
tags: ['外文翻译', '前端工程化']
---

关于 [Rollup](https://rollupjs.org/guide/en) 的常见问题，原文出自：[Frequently Asked Questions](https://rollupjs.org/guide/en#faqs)

# 关于 Rollup 的常见问题

## ES 模块为什么比 CommonJS 模块更好？

ES 模块是 ECMA 组织的官方标准，同时也是 JavaScript 代码结构的明确发展方向，而 CommonJS 模块作为一种特殊的传统模块化格式，是 ES 模块提出之前的一个临时的解决方案。ES 模块支持静态分析（static analysis），这使得像 tree-shaking 之类的代码优化手段成为可能，同时支持像循环引用（circular references）和动态绑定（live bindings）之类的高级特性。

## tree-shaking 是什么？

Tree-shaking 也被称为 live code inclusion，是消除给定项目中冗余代码（特指未曾使用到的代码）的过程。它和 [dead code elimination](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.jnypozs9n) 类似但效率更高。

## 在 Node.js 环境中，如何使用 Rollup 支持 CommonJS 模块？

Rollup 全力实现 ES 模块的特性，并未支持 Node.js、Npm、require() 和 CommonJS 模块的规范和工作方式。因此，加载 CommonJS 模块和 Node 模块位置的解析逻辑是以可选插件的形式实现的，默认并未包含在 Rollup 的内核中。只需要通过 npm 安装 [commonjs](https://github.com/rollup/rollup-plugin-commonjs) 和 [node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) 插件，并在 rollup.config.js 中启用它们即可。如果需要引入 JSON 格式的文件模块，你还需要安装 [json](https://github.com/rollup/rollup-plugin-json) 插件。

## 为什么 node-resolve 没有作为内置特性默认支持？

有两个主要的原因：

-   在架构层面，Rollup 本质上是 Node 环境和浏览器环境上各种模块加载器的 polyfill。在浏览器环境中，`import foo from 'foo'` 不会按照预期的结果去工作，因为浏览器并未使用 Node 的解析算法。
-   在现实层面，如果这些考虑可以在 API 上简洁的加以区分，会使得软件开发更加容易。Rollup 的核心已经非常庞大了，任何可以阻止它变得更大的设计都是一个好事情。同时，这样也使得修改缺陷和增加特性变得更加容易。保持 Rollup 的简洁可以减少潜在的技术瓶颈。

## Rollup 是被用来构建库还是被用来构建应用？

Rollup 已经有许多主流的 JavaScript 库在使用了，也可以用来构建绝大多数的应用。然而如果你想在较老的浏览器中使用代码拆分（code-splitting）和动态引入（dynamic imports）的话，需要一个额外的运行时（runtime）环境来加载缺失的块（chunks）。在这种场景下，我们推荐使用 [SystemJS Production Build](https://github.com/systemjs/systemjs#browser-production)，因为它很好的集成了 Rollup 的导出格式，而且可以很好的处理 ES 模块的动态绑定（live bindings）和重新导出（re-export）之类的边缘场景（edge cases）。或者，也可以使用实现 AMD 规范的加载器。

## 谁制作了 Rollup 的 Logo。太可爱了!

我就知道！是 [Julian Lloyd](https://twitter.com/jlmakes)。

# 原文

> Frequently Asked Questions
>
> 1.  Why are ES modules better than CommonJS Modules?
>
> ES modules are an official standard and the clear path forward for JavaScript code structure, whereas CommonJS modules are an idiosyncratic legacy format that served as a stopgap solution before ES modules had been proposed. ES modules allow static analysis that helps with optimizations like tree-shaking, and provide advanced features like circular references and live bindings.
>
> 2.  What Is "tree-shaking"?
>
> Tree-shaking, also known as "live code inclusion," is the process of eliminating code that is not actually used in a given project. It is [similar to dead code elimination](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.jnypozs9n) but can be much more efficient.
>
> 3.  How do I use Rollup in Node.js with CommonJS modules?
>
> Rollup strives to implement the specification for ES modules, not necessarily the behaviors of Node.js, NPM, require(), and CommonJS. Consequently, loading of CommonJS modules and use of Node's module location resolution logic are both implemented as optional plugins, not included by default in the Rollup core. Just npm install the [commonjs](https://github.com/rollup/rollup-plugin-commonjs) and [node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) plugins and then enable them using a rollup.config.js file and you should be all set. If the modules import JSON files, you will also need the [json](https://github.com/rollup/rollup-plugin-json) plugin.
>
> 4.  Why isn't node-resolve a built-in feature?
>
> There are two primary reasons:
>
> -   Philosophically, it's because Rollup is essentially a polyfill of sorts for native module loaders in both Node and browsers. In a browser, import foo from 'foo' won't work, because browsers don't use Node's resolution algorithm.
> -   On a practical level, it's just much easier to develop software if these concerns are neatly separated with a good API. Rollup's core is quite large, and everything that stops it getting larger is a good thing. Meanwhile, it's easier to fix bugs and add features. By keeping Rollup lean, the potential for technical debt is small.
>
> 5.  Is Rollup meant for building libraries or applications?
>
> Rollup is already used by many major JavaScript libraries, and can also be used to build the vast majority of applications. However if you want to use code-splitting or dynamic imports with older browsers, you will need an additional runtime to handle loading missing chunks. We recommend using the [SystemJS Production Build](https://github.com/systemjs/systemjs#browser-production) as it integrates nicely with Rollup's system format output and is capable of properly handling all the ES module live bindings and re-export edge cases. Alternatively, an AMD loader can be used as well.
>
> 6.  Who made the Rollup logo? It's lovely.
>
> [Julian Lloyd!](https://twitter.com/jlmakes)
