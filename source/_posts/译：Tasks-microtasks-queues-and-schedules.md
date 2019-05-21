---
title: '译：Tasks, microtasks, queues and schedules'
date: 2019-05-22 06:11:09
tags: [Node, 外文翻译]
---

原文出自：[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)。很多涉及 Event Loop 的讨论不约而同的都引用到了这篇文章，比如[理解event loop](https://imweb.io/topic/5b148768d4c96b9b1b4c4ea1)，我决定把它翻译一遍。

# 关于作者

![](/jake.jpg)

[Jake Archibald](https://jakearchibald.com/)，谷歌公司的一位开发布道者（[developer advocate](https://www.zhihu.com/question/52479600?sort=created)）。

# 任务，微任务，队列和时间表

当我告诉我的同事 [Matt Gaunt](https://twitter.com/gauntface) 我正在考虑写一篇关于微任务队列和浏览器事件循环执行机制的文章时，他说：“老实说，我不会去读的”。好吧，不管怎么样，我已经写了，我们一起坐下来欣赏一下吧，好吗？

事实上，如果你更喜欢视频，[Philip Roberts](https://twitter.com/philip_roberts) 在 JSConf 上就事件循环做了一次很好的演讲，虽然微任务并没有被提及，但它是对本文余下内容的一个很好的介绍。总之，我们开始吧。。。
