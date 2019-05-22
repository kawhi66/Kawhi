---
title: '译：Tasks, microtasks, queues and schedules'
date: 2019-05-22 06:11:09
tags: [Node, 外文翻译]
---

原文出自：[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)，强烈建议您读一遍原文，很幽默，也很有趣。很多涉及 Event Loop 的讨论不约而同的都引用到了这篇文章，比如[理解event loop](https://imweb.io/topic/5b148768d4c96b9b1b4c4ea1)，我决定把它翻译一遍。

# 关于作者

![](/jake.jpg)

[Jake Archibald](https://jakearchibald.com/)，谷歌公司的一位技术布道者（[developer advocate](https://www.zhihu.com/question/52479600?sort=created)）。

# 任务，微任务，队列和时间表

当我告诉我的同事 [Matt Gaunt](https://twitter.com/gauntface) 我正在考虑写一篇关于微任务队列和浏览器事件循环执行机制的文章时，他说：“老实说，我不会去读的”。好吧，不管怎么样，我已经写了，我们一起坐下来欣赏一下吧，好吗？

事实上，如果你更喜欢视频，[Philip Roberts](https://twitter.com/philip_roberts) 在 JSConf 上就事件循环做了一次很好的演讲，虽然微任务并没有被提及，但它是对本文余下内容的一个很好的介绍。总之，我们开始吧。。。

先来一点儿 JavaScript：

```JavaScript
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```

日志会以怎样的顺序打印出来 ？

## 试一试

![](/test-0.png)

_注：这只是一张截图_

正确的答案是：`script start`，`script end`，`promise1`，`promise2`，`setTimeout`，但在不同的浏览器上，它的表现很不一致。

在 Microsoft Edge，Firefox 40，iOS Safari 和 desktop Safari 8.0.8 上面，`setTimeout` 在 `promise1` 和 `promise2` 之前被打印出来，这似乎是一个竞争的场景（race conditioin）。这真的很奇怪，因为 Firefox 39 和 Safari 8.0.7 都打印出了正确的结果。

## 为什么会发生这种情况

要想理解这种情况你需要知道事件循环是如何处理任务（tasks）和微任务（microtasks）的。如果是第一次听到这个的话，可能会有很多东西需要认真研究。深呼吸。。。

每个线程（thread）有自己的事件循环，因此每个 web worker 都有它自己事件循环能够独立执行，然而在同一个域下的所有窗口会共享一个事件循环，就好像它们可以同步通信一样。事件循环不停地在运转执行任意一个排队的任务。一个事件循环有多个任务源（像 [IndexedDB](http://w3c.github.io/IndexedDB/#introduction) 一样，会有规范来定义这些任务源），这些任务源（task source）保证了任务的执行顺序，但在每个循环中，浏览器可以选择要执行的任务源。这使得浏览器可以优先选择那些对性能敏感的任务，比如用户输入（user-input）。好吧好吧，跟上我的思路。。。

无论从内部构件还是到 JavaScript/DOM 层面，任务都是被预先安排好的，浏览器可以选择并确保这些任务顺序的执行。在任务的执行间隔，浏览器可能会去渲染界面的更新。从一个鼠标点击任务到一个事件回调需要安排一个任务，还有像解析 HTML，以及上面的例子中提到的定时器 `setTimeout`。

`setTimeout` 会等待一个给定的延迟时间然后才会为它的回调函数安排一个新的任务。这就是为什么 `setTimeout` 在 `script end` 之后打印出来，因为打印 `script end` 是属于第一个任务，而 `setTimeout` 在一个单独的任务中打印出来。好吧，我们就快过去了，但我还需要你为接下来的一点儿内容坚持。。。

微任务（Microtasks）通常用来安排那些应该在当前的脚本运行结束之后需要被立即执行的任务，比如响应一个批量的动作，或者某些异步动作不用麻烦要去创建一个全新的任务。在每一个任务结束之后，或者是回调函数执行完毕之后，只要没有其他正在执行（mid-execution）的 JavaScript 脚本，微任务队列就会开始运行。在微任务执行中产生的其他任意的微任务也会被添加到微任务队列的末端并执行。微任务包括 MutationObserver 回调函数，还有上面的例子中提到的，Promise 回调函数。

Promise 一旦被解决，或者它已经被解决了，它会立即为它的回调函数安排一个微任务。这确保了 promise 回调函数异步执行，即使这个 promise 已经被解决了。因此调用一个已经解决的 promise 的 `then(yey, nay)` 会立即安排一个微任务。这就是为什么 `promise1` 和 `promise2` 会在 `script end` 之后被打印出来，因为当前运行的脚本必须在微任务被处理之前结束。`promise1` 和 `promise2` 在 `setTimeout` 之前打印出来，因为微任务总是在下一个任务之前发生。

来吧，一步一步：

![](/animate.png)

_注：这只是一张截图_

是的，我创建了一个分步的动态图（这里可动不了）。你的周六怎么过的？和你的朋友出去晒太阳吗？好吧，我没有。以防我天才的 UI 设计表达的不清楚，可以点击上面的箭头来往前走。

### 为什么有些浏览器不是这样的？

一些浏览器会打出 `script start`，`script end`，`setTimeout`，`promise1`，`promise2`。它们在 `setTimeout` 之后运行 promise 回调函数。可能是因为这些浏览器把 promise 回调函数作为新任务的一部分而不是作为一个微任务去调用。

这其实也可以理解，因为 promise 来自 ECMAScript 而不是 HTML。ECMAScript 有 “jobs” 的概念，它和微任务类似，但从一些模糊不清的讨论（[vague mailing list discussions](https://esdiscuss.org/topic/the-initialization-steps-for-web-browsers#content-16)）中，他们的关系并不明确。但是，出于一些好的理由，一致的认识是 promises 应该作为微任务队列的一部分去安排和执行。

把 promises 作为任务去处理会导致一些性能问题，比如回调函数可能会因为任务相关的事情产生不必要的延迟，比如界面渲染。也可能对与其他任务源的交互产生一些非决定性的因素，还会中断与其他 API 的交互，还有更多稍后再提。

这里是一个 Edge 将 promises 作为微任务处理的一个声明。WebKit 正在做正确的事情，因此我假设 Safari 最终也会选择修复这个问题，Firefox 43 似乎在 已经被修复掉了。

有趣的是，自从 Safari 和 Firefox 修复之后又做了回退，我想知道这是不是仅仅是个巧合。

## 如果同时使用了任务和微任务怎么区分

测试是一种方式。看 promises 和 `setTimeout` 日志出现的相对顺序，尽管你得依赖它们的实现是正确的。

有把握的一种方式是查阅规范。比如，[`setTimeout` 规范的第 14 点](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timer-initialisation-steps)指出它安排了一个任务，而 [MutationObserver 规范的第 5 点](https://dom.spec.whatwg.org/#queue-a-mutation-record)指出它安排了一个微任务。

之前提到，在 ECMAScript 的世界里，它们把微任务称为 “jobs”。在 [PerformPromiseThen](http://www.ecma-international.org/ecma-262/6.0/#sec-performpromisethen) 的第 8 点指出，`EnqueueJob` 被调用去安排一个微任务。

现在让我们看一个更复杂的例子。我有种预感：不，他们还没有准备好。但我决定忽略它，你已经准备好了，我们继续吧。。。

## Level 1 bossfight

在写这篇文章之前，我把下面的问题搞错了。这里是一部分 html：

```JavaScript
<div class="outer">
  <div class="inner"></div>
</div>
```

给出下面的 JS，当我点击 `div.inner` 时，什么会被打出来？

```JavaScript
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function() {
  console.log('mutate');
}).observe(outer, {
  attributes: true
});

// Here's a click listener…
function onClick() {
  console.log('click');

  setTimeout(function() {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function() {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

继续，在看答案前试一下。提示：日志可能会打印超过一次。

## 测试

点击内部的正方形触发一个点击事件：

![](/test.png)

_注：这里只是在 Chrome 下的执行结果截图_

你猜的一样吗？如果不一样，你也可能是正确的。不幸的是，浏览器在这里的表现并不一致。

![](/test-result.png)

## 谁是正确的

分发 “click” 事件是一个任务。Mutation observer 和 promise 被作为微任务安排。`setTimeout` 回调函数被作为任务安排。所以这里是这样的：

![](/animate-1.png)

_注：这只是一张截图_

因此，Chrome 是对的。我有一点儿没想到的是，微任务是在回调函数之后（只要没有其他的 JavaScript 脚本正在运行）被执行的，我以为它仅限于任务结尾。这个规则来自 HTML 规范对调用回调函数的说明：

> If the [stack of script settings objects](https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects) is now empty, [perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)
> — [HTML: Cleaning up after a callback](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback) step 3

。。。并且一个微任务检查节点包含了微任务队列的检查，除非我们已经执行过微任务队列。类似的，ECMAScript 对 “jobs” 是这样描述的：

> Execution of a Job can be initiated only when there is no running execution context and the execution context stack is empty…
> — [ECMAScript: Jobs and Job Queues](http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues)

。。。尽管在一个 HTML 上下文中，"can be" 变成了 “must be”。

## 浏览器哪里搞错的

Firefox 和 Safari 在点击事件的监听函数之间正确地耗尽了微任务队列，就像 mutation 回调函数表现出的那样，但 promises 的安排似乎是不同的。考虑到 “jobs” 和 微任务是很模糊的，这可以理解，但我仍然期望他们在监听函数之间去执行。[Firefox 声明](https://bugzilla.mozilla.org/show_bug.cgi?id=1193394)。[Safari 声明](https://bugs.webkit.org/show_bug.cgi?id=147933)。

我们已经看到 Edge 对 promises 的安排是错误的，它也没有在点击事件回调函数之间耗尽微任务队列，而是在调用所有的事件监听函数之后做的，这可以解释为什么在 `click` 打印之后，一个 `mutate` 日志被打印了出来。[Bug 声明](https://connect.microsoft.com/IE/feedbackdetail/view/1658386/microtasks-queues-should-be-processed-following-event-listeners)。

## Level 1 boss's angry older brother

使用上面的同样的例子，如果我们这样执行会发生什么：

```JavaScript
inner.click();
```

## 试一试

![](/test-1.png)

_注：这只是一张截图_

这里是不同浏览器的执行结果：

![](/test-result-1.png)

我发誓我在 Chrome 上一直得到不同的结果，考虑到我之前测试可能的失误，这个图我已经更新了好多次了。如果你在 Chrome 下看到不同的结果，在评论中告诉我它的版本。

## 为什么会不同

它应该这样运行：

![](/animate-2.png)

_注：这只是一张截图_

因此正确的顺序是：`click`，`click`，`promise`，`mutate`，`promise`，`timeout`，`timeout`，Chrome 似乎做对了。

在每一个监听函数之后被调用。。。

> If the [stack of script settings objects](https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects) is now empty, [perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)
> — [HTML: Cleaning up after a callback](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback) step 3

之前，这意思是说微任务在监听函数之间运行，但 `.click()` 使得这个事件同步分发，因此在回调函数之间，调用 `.click()` 的脚本仍然保留在执行栈中。上面的规则确保了微任务不会中断正在运行中的 JavaScript 脚本。这意味着我们不会在事件监听函数之间执行微任务队列，它们是在全部的事件监听函数执行完之后执行的。

## 这重要吗

是的，它可能在不经意间给你带来麻烦。我曾遇到过，当时我正在尝试[使用 promises 而不是奇怪的 `IDBRequest` 对象 为 IndexedDB 创建一个简单的包装器库](https://github.com/jakearchibald/indexeddb-promised/blob/master/lib/idb.js)。它几乎使得[使用 IDB 变得很有趣](https://github.com/jakearchibald/indexeddb-promised/blob/master/test/idb.js#L36)。

当 IDB 触发了一个成功的事件，相关的[事物对象在分发之后失活](http://w3c.github.io/IndexedDB/#fire-a-success-event)（第四步）。如果我创建一个 promise 在这个事件触发的时候 `resolve`，回调函数应该在第四步之前运行，而此时事务仍然处于活动状态，但它在 Chrome 之外的浏览器中并没有发生，这个库变得没什么用了。

事实上在 Firefox 中，你可以解决这个问题，因为像 [es6-promise](https://github.com/jakearchibald/es6-promise) 这样的 promise 实现库使用 mutation observers 作为回调函数，它正确的作为微任务来使用。Safari 似乎从那次修复之后还存在竞争的情况，但那可能仅仅是它们的残缺的实现。不幸的是在 IE/Edge 中，一直是错误的，因为 mutation 事件不会在回调函数之后处理。

希望我们将很快看到一些试验性的改进。

## 你做到了

总结：

-   任务按顺序执行，浏览器可能在任务之间执行界面渲染
-   微任务按顺序执行，并且是在下面的情况下执行：
    -   在每一个回调函数执行之后，只要没有其它正在运行的 JavaScript 脚本
    -   在每一个任务的末尾

希望你现在对事件循环有了自己的理解，或者至少有一个理由去躺下来想一想。

说真的，还有人在读吗？在吗？在吗？

感谢 Anne van Kesteren，Domenic Denicola，Brian Kardell 和 Matt Gaunt 对本文的校正和修改。是的，最后 Matt 读了这篇文章，我甚至不需要去提醒他。

# Tasks, microtasks, queues and schedules

When I told my colleague Matt Gaunt I was thinking of writing a piece on microtask queueing and execution within the browser's event loop, he said "I'll be honest with you Jake, I'm not going to read that". Well, I've written it anyway, so we're all going to sit here and enjoy it, ok?

Actually, if video's more your thing, Philip Roberts gave a great talk at JSConf on the event loop - microtasks aren't covered, but it's a great introduction to the rest. Anyway, on with the show…

Take this little bit of JavaScript:

```JavaScript
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```

In what order should the logs appear?

## Try it

![](/test-0.png)

The correct answer: `script start`, `script end`, `promise1`, `promise2`, `setTimeout`, but it's pretty wild out there in terms of browser support.

Microsoft Edge, Firefox 40, iOS Safari and desktop Safari 8.0.8 log `setTimeout` before `promise1` and `promise2` - although it appears to be a race condition. This is really weird, as Firefox 39 and Safari 8.0.7 get it consistently right.

## Why this happens

To understand this you need to know how the event loop handles tasks and microtasks. This can be a lot to get your head around the first time you encounter it. Deep breath…

Each 'thread' gets its own **event loop**, so each web worker gets its own, so it can execute independently, whereas all windows on the same origin share an event loop as they can synchronously communicate. The event loop runs continually, executing any tasks queued. An event loop has multiple task sources which guarantees execution order within that source (specs [such as IndexedDB](http://w3c.github.io/IndexedDB/#database-access-task-source) define their own), but the browser gets to pick which source to take a task from on each turn of the loop. This allows the browser to give preference to performance sensitive tasks such as user-input. Ok ok, stay with me…

**Tasks** are scheduled so the browser can get from its internals into JavaScript/DOM land and ensures these actions happen sequentially. Between tasks, the browser may render updates. Getting from a mouse click to an event callback requires scheduling a task, as does parsing HTML, and in the above example, `setTimeout`.

`setTimeout` waits for a given delay then schedules a new task for its callback. This is why `setTimeout` is logged after `script end`, as logging `script end` is part of the first task, and `setTimeout` is logged in a separate task. Right, we're almost through this, but I need you to stay strong for this next bit…

**Microtasks** are usually scheduled for things that should happen straight after the currently executing script, such as reacting to a batch of actions, or to make something async without taking the penalty of a whole new task. The microtask queue is processed after callbacks as long as no other JavaScript is mid-execution, and at the end of each task. Any additional microtasks queued during microtasks are added to the end of the queue and also processed. Microtasks include mutation observer callbacks, and as in the above example, promise callbacks.

Once a promise settles, or if it has already settled, it queues a microtask for its reactionary callbacks. This ensures promise callbacks are async even if the promise has already settled. So calling `.then(yey, nay)` against a settled promise immediately queues a microtask. This is why `promise1` and `promise2` are logged after `script end`, as the currently running script must finish before microtasks are handled. `promise1` and `promise2` are logged before `setTimeout`, as microtasks always happen before the next task.

So, step by step:

![](/animate.png)

Yes that's right, I created an animated step-by-step diagram. How did you spend your Saturday? Went out in the sun with your friends? Well I didn't. Um, in case it isn't clear from my amazing UI design, click the arrows above to advance.

### What are some browsers doing differently?

Some browsers log `script start`, `script end`, `setTimeout`, `promise1`, `promise2`. They're running promise callbacks after `setTimeout`. It's likely that they're calling promise callbacks as part of a new task rather than as a microtask.

This is sort-of excusable, as promises come from ECMAScript rather than HTML. ECMAScript has the concept of "jobs" which are similar to microtasks, but the relationship isn't explicit aside from [vague mailing list discussions](https://esdiscuss.org/topic/the-initialization-steps-for-web-browsers#content-16). However, the general consensus is that promises should be part of the microtask queue, and for good reason.

Treating promises as tasks leads to performance problems, as callbacks may be unnecessarily delayed by task-related things such as rendering. It also causes non-determinism due to interaction with other task sources, and can break interactions with other APIs, but more on that later.

Here's [an Edge ticket](https://connect.microsoft.com/IE/feedback/details/1658365) for making promises use microtasks. WebKit nightly is doing the right thing, so I assume Safari will pick up the fix eventually, and it appears to be fixed in Firefox 43.

Really interesting that both Safari and Firefox suffered a regression here that's since been fixed. I wonder if it's just a coincidence.

## How to tell if something uses tasks or microtasks

Testing is one way. See when logs appear relative to promises & `setTimeout`, although you're relying on the implementation to be correct.

The certain way, is to look up the spec. For instance, [step 14 of setTimeout](https://html.spec.whatwg.org/multipage/webappapis.html#timer-initialisation-steps) queues a task, whereas [step 5 of queuing a mutation record](https://dom.spec.whatwg.org/#queue-a-mutation-record) queues a microtask.

As mentioned, in ECMAScript land, they call microtasks "jobs". In [step 8.a of `PerformPromiseThen`](http://www.ecma-international.org/ecma-262/6.0/#sec-performpromisethen), `EnqueueJob` is called to queue a microtask.

Now, let's look at a more complicated example. Cut to a concerned apprentice "No, they're not ready!". Ignore him, you're ready. Let's do this…

## Level 1 bossfight

Before writing this post I'd have gotten this wrong. Here's a bit of html:

```JavaScript
<div class="outer">
  <div class="inner"></div>
</div>
```

Given the following JS, what will be logged if I click `div.inner`?

```JavaScript
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function() {
  console.log('mutate');
}).observe(outer, {
  attributes: true
});

// Here's a click listener…
function onClick() {
  console.log('click');

  setTimeout(function() {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function() {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

Go on, give it a go before peeking at the answer. Clue: Logs can happen more than once.

## Test it

Click the inner square to trigger a click event:

![](/test.png)

Was your guess different? If so, you may still be right. Unfortunately the browsers don't really agree here:

![](/test-result.png)

## Who's right?

Dispatching the 'click' event is a task. Mutation observer and promise callbacks are queued as microtasks. The `setTimeout` callback is queued as a task. So here's how it goes:

![](/animate-1.png)

So it's Chrome that gets it right. The bit that was 'news to me' is that microtasks are processed after callbacks (as long as no other JavaScript is mid-execution), I thought it was limited to end-of-task. This rule comes from the HTML spec for calling a callback:

> If the [stack of script settings objects](https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects) is now empty, [perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)
> — [HTML: Cleaning up after a callback](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback) step 3

…and a microtask checkpoint involves going through the microtask queue, unless we're already processing the microtask queue. Similarly, ECMAScript says this of jobs:

> Execution of a Job can be initiated only when there is no running execution context and the execution context stack is empty…
> — [ECMAScript: Jobs and Job Queues](http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues)

…although the "can be" becomes "must be" when in an HTML context.

## What did browsers get wrong?

**Firefox** and **Safari** are correctly exhausting the microtask queue between click listeners, as shown by the mutation callbacks, but promises appear to be queued differently. This is sort-of excusable given that the link between jobs & microtasks is vague, but I'd still expect them to execute between listener callbacks. [Firefox ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1193394). [Safari ticket](https://bugs.webkit.org/show_bug.cgi?id=147933).

With **Edge** we've already seen it queue promises incorrectly, but it also fails to exhaust the microtask queue between click listeners, instead it does so after calling all listeners, which accounts for the single `mutate` log after both `click` logs. [Bug ticket](https://connect.microsoft.com/IE/feedbackdetail/view/1658386/microtasks-queues-should-be-processed-following-event-listeners).

## Level 1 boss's angry older brother

Ohh boy. Using the same example from above, what happens if we execute:

```JavaScript
inner.click();
```

This will start the event dispatching as before, but using script rather than a real interaction.

## Try it

![](/test-1.png)

And here's what the browsers say:

![](/test-result-1.png)

And I swear I keep getting different results from Chrome, I've updated this chart a ton of times thinking I was testing Canary by mistake. If you get different results in Chrome, tell me which version in the comments.

## Why is it different?

Here's how it should happen:

![](/animate-2.png)

So the correct order is: `click`, `click`, `promise`, `mutate`, `promise`, `timeout`, `timeout`, which Chrome seems to get right.

After each listener callback is called…

> If the [stack of script settings objects](https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects) is now empty, [perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)
> — [HTML: Cleaning up after a callback](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback) step 3

Previously, this meant that microtasks ran between listener callbacks, but `.click()` causes the event to dispatch synchronously, so the script that calls `.click()` is still in the stack between callbacks. The above rule ensures microtasks don't interrupt JavaScript that's mid-execution. This means we don't process the microtask queue between listener callbacks, they're processed after both listeners.

## Does any of this matter?

Yeah, it'll bite you in obscure places (ouch). I encountered this while trying to create [a simple wrapper library for IndexedDB that uses promises](https://github.com/jakearchibald/indexeddb-promised/blob/master/lib/idb.js) rather than weird `IDBRequest` objects. It [almost makes IDB fun to use](https://github.com/jakearchibald/indexeddb-promised/blob/master/test/idb.js#L36).

When IDB fires a success event, the related [transaction object becomes inactive after dispatching](http://w3c.github.io/IndexedDB/#fire-a-success-event) (step 4). If I create a promise that resolves when this event fires, the callbacks should run before step 4 while the transaction is still active, but that doesn't happen in browsers other than Chrome, rendering the library kinda useless.

You can actually work around this problem in Firefox, because promise polyfills such as [es6-promise](https://github.com/jakearchibald/es6-promise) use mutation observers for callbacks, which correctly use microtasks. Safari seems to suffer from race conditions with that fix, but that could just be their [broken implementation of IDB](http://www.raymondcamden.com/2014/09/25/IndexedDB-on-iOS-8-Broken-Bad). Unfortunately, things consistently fail in IE/Edge, as mutation events aren't handled after callbacks.

Hopefully we'll start to see some interoperability here soon.

## You made it!

In summary:

-   Tasks execute in order, and the browser may render between them
-   Microtasks execute in order, and are executed:
    -   after every callback, as long as no other JavaScript is mid-execution
    -   at the end of each task

Hopefully you now know your way around the event loop, or at least have an excuse to go and have a lie down.

Actually, is anyone still reading? Hello? Hello?

Thanks to Anne van Kesteren, Domenic Denicola, Brian Kardell, and Matt Gaunt for proofreading & corrections. Yeah, Matt actually read it in the end, I didn't even need to go full "Clockwork Orange" on him.
