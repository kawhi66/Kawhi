---
title: Node.js 的 Event Loop
date: 2019-05-23 06:49:15
tags: Node
---

JavaScript 运行机制的特点就是单线程，在 Node.js 环境下也一样。只是在 Node.js 环境下需要与内核对话，所以单线程面对的场景更多，也更复杂。主线程从任务队列中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为 Event Loop（事件循环）。
