---
title: Node.js 的 Event Loop
date: 2019-05-23 06:49:15
tags: Node
---

JavaScript 运行机制的特点就是单线程，在 Node.js 环境下也一样。只是在 Node.js 环境下需要与内核对话，所以单线程面对的场景更多，也更复杂。主线程从任务队列中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为 Event Loop（事件循环）。

# 栈和队列

在计算机科学中，一个**栈（stack）**是一种抽象数据类型，用作表示元素的集合。

<div style="width: 560px;">![](/stack.png)</div>

栈的特点是**后进先出（LIFO = last in, first out）**，具有两种主要操作：

-   push：添加元素到栈的顶端（末尾）
-   pop：移除栈最顶端（末尾）的元素

一个**队列（queue）**是一种特殊类型的抽象数据类型或集合，集合中的实体按顺序保存。

![](/queue.svg)

队列的特点是**先进先出（FIFO = first in, first out）**，具有两种主要操作：

-   enqueue：向队列的后端位置添加实体，称为入队
-   dequeue：从队列的前端位置移除实体，称为出队

# 浏览器环境

浏览器环境中的事件循环相对简单。主线程运行同步任务产生堆栈，同时调用各种 WebAPIs 执行异步任务，执行结束后将回调函数添加到任务队列中，主线程在执行完同步任务之后开始处理在队列中排队的任务。

![](/browser.png)

# Node.js 环境

相对于浏览器环境，Node.js 环境中的事件循环要复杂很多。在 Node.js 环境中，我们通常所说的单线程其实是一个事件循环线程（或者叫主线程），事实上还有另外一种类型的线程 —— 工作线程；即便是这个事件循环线程，它的运行机制也和浏览器环境有很大的不同，因为它是分阶段的。

## 工作线程

<div style="width: 560px; margin-top: 20px;">![](/node-thread-pool.png)</div>

## 事件循环

<div style="width: 560px; margin-top: 20px;">![](/node-main-thread.png)</div>
