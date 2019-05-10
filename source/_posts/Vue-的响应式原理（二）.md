---
title: Vue 的响应式原理（二）
date: 2019-05-10 18:20:00
tags: Vue
---

上一篇文章对 Object.defineProperty 做了些了解，本文尝试从 Vue 源码出发分析 Object.defineProperty 在 Vue 中典型的应用场景，这好像比我想的要容易些。

# 简介

这里有必要重复一下 Vue 响应式的实现原理，不过本文只会涉及一部分，**Vue 在组件实例初始化的时候，会遍历 data 函数返回值的所有属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter**。这部分工作主要是对 data 函数的处理，data 函数返回的是一个普通的 JavaScript 对象，Vue 用 Object.defineProperty 对其中的每一个属性做了代理，将其转换为了**访问器属性**。我摘取了两个代码片段可以说明这一点。

_注：在对源码的分析过程中，我摘取了一些关键的代码片段保存在了 [vue-source-snippets](https://github.com/kawhi66/vue-source-snippets)，这些代码片段可以帮助理解。_

# initData 代码片段

```JavaScript
// 源码中的路径：src/core/instance/state.js
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
}
```

不难看出，这个方法首先对组件实例中定义的 data 函数做了处理，然后遍历 data 函数返回的数据对象，对每一个属性做了 `proxy(vm, '_data', key)`。这个方法也可以解释一些 Vue 相关的问题，**比如 data 为什么必须定义为一个函数，以及 data，props 和 methods 的优先级问题**。

# proxy 代码片段

```JavaScript
// 源码中的路径：src/core/instance/state.js
function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

结合上一篇文章，这个方法做的事情就是将 target[sourceKey] 中的 key 由**数据属性**转换为**访问器属性**，\[[ Configurable ]] 和 \[[ Enumerable ]] 默认为 `false`，也就是说 key 在之后 **不可枚举，不可删除**。

# 总结

这里只是对 Vue 实例中的 data 函数的代理过程做了分析，而且这个分析过程好像比我想象的要容易的多。下一篇文章会继续从源码角度分析 Watcher 实例的的创建过程和工作原理。
