---
title: 译：Introduction to D3（二）
date: 2019-08-09 10:08:28
tags: 外文翻译
---

本文是译文：[介绍 D3](https://observablehq.com/@uwdata/introduction-to-d3) 的第二部分，也是最后一部分，主要内容是介绍 D3 的其他交互技术。

# 关于作者

![](/Halden Lin, Tongshuang Wu.png)

[Halden Lin](https://haldenl.com)，[To·ngshuang (Sherry) Wu](http://homes.cs.washington.edu/~wtshuang/)，[华盛顿大学交互数据实验室](https://idl.cs.washington.edu)。

# 介绍 D3

## 其它的交互技术

### 创建提示信息

从头开始创建提示信息工具通常比较困难。和图例类似，像 d3-tip 之类的库可能会很方便。

引入 d3-tip：

```JavaScript
import d3Tip from "d3-tip";
```

本质上，d3-tip 会为你创建一个可以定义样式的 HTML 元素块。当创建提示信息的时候你需要按照下面的方法来设定它：

1. 为提示信息提供一些样式。
2. 设置一些偏移量使得提示信息在最上面。
3. 使用 `html` 来设置你想要展示在提示信息块中的 html 元素。在函数中入参 `d` 表示提示信息依赖的底层数据。

```JavaScript
const tip: any = d3Tip()
  .attr("class", "d3-tip")
  .style("color", "white")
  .style("background-color", "black")
  .style("padding", "6px")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .offset([-10, 0])
  .html(function(d: Row) {
    return `<strong>${d3.format(",")(d.people)}</strong> people`;
  });
```

贴士：`d3.format()` 能帮助你以人类可读的格式展示数字。在[这里](https://github.com/d3/d3-format)查看更多的可能的格式！

用 `call()` 添加提示信息：

```JavaScript
container.call(tip);
```

我们现在给已经绑定数据的矩形条添加事件监听，以使得提示信息可以正确的触发。

事件监听可以通过 `on()` 方法添加到一些特定的标记上，这些标记会对在底层的已选元素上的事件作出响应。`on()` 方法接收事件名称和一个当指定事件发生时每次都会触发的回调函数。

对事件监听来说，可以使用一个异步函数作为回调。回调函数的入参 `d` 表示标记的底层数据。在作用域内，`this`，相当于 DOM 元素。

事件监听包括：

+ mousedown：当鼠标在一个元素上按下的时候触发
+ mouseup：当鼠标在一个元素上释放的时候触发
+ mouseover：当鼠标进入一个元素上的时候触发
+ mouseout：当鼠标在一个元素上离开的时候触发
+ mousemove：当鼠标在一个元素上移动的时候触发
+ click：当一个鼠标点击的时候触发（在一个元素上 mousedown，然后 mouseup）
+ contextmenu：当鼠标右键在一个元素上点击的时候触发
+ dblclick：当鼠标在很短事件内在一个元素上两次点击的时候触发

```JavaScript
chart
  .selectAll(".bar")
  .on("mouseover", function(this: HTMLElement, d: Row) {
    // show the tooltip on mouse over
    tip.show(d, this);
    // when the bar is mouse-overed, we slightly decrease opacity of the bar.
    d3.select(this).style("opacity", 0.7);
  })
  .on("mouseout", function(this: HTMLElement, d: Row) {
    // hide the tooltip on mouse out
    tip.hide();
    d3.select(this).style("opacity", 1);
  });
```

我们还需要给我们在更新函数中追加的柱形条（collapsed for space）添加这些事件监听。

```JavaScript
function updateBetter(sex: number, step: number) {
  // ...
  // Step 3. Enter.
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (d: Row) => color(d.sex))
    .on("mouseover", function(this: HTMLElement, d: Row) {
      // show the tooltip on mouse over
      tip.show(d, this);
      // when the bar is mouse-overed, we slightly decrease opacity of the bar.
      d3.select(this).style("opacity", 0.7);
    })
    .on("mouseout", function(this: HTMLElement, d: Row) {
      // hide the tooltip on mouse out
      tip.hide();
      d3.select(this).style("opacity", 1);
    })
    .transition("enter-transition")
    .duration(500)
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people));

  // ...
}
```

在柱状条上悬停看会发生什么！

![](/main.png)

### 动态可点击的图例

目前我们的可视化图在任意一个给定的年份上仅仅能展示一个单一的性别，如果我们能做到以下几点将会很有用：

1. 我们的图例展示已选的性别。
2. 用户能够使用图例作为一个输入条件来更新我们的可视化图。

#### 展示选择的性别

记住我们的图例是和数据绑定的！当我们手动创建它的时候，我们把它绑定在了我们的颜色域上。这意味着我们可以根据数据来设置它的样式（as we have with its fill）。

我们可以使用一个数据函数来设置每个矩形的透明度：

```JavaScript
legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
```

并且类似地，我们可以加粗文本或者修改它的透明度：

```JavaScript
legend
  .selectAll(".legend-text")
  .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
  .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));
```

我们的更新函数同样也需要应用这些修改（collapsed for space）。

```JavaScript
function updateBetter(sex: number, step: number) {
  // ...
  // update legend
  legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
  legend
    .selectAll(".legend-text")
    .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
    .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));

  // ...
}
```

#### 给图例添加点击事件

要想当一个图例项被点击时执行一次更新，我们介绍一个图例项的 `click` 事件监听。当一个图例项被点击时，我们通过传递给它绑定的性别和一个 0 的步长来更新我们的可视化图。

```JavaScript
legend.on("click", (d: number) => update(d, 0));
```

最后，我们修改图例上的光标为 `pointer`。

```JavaScript
legend.style("cursor", "pointer");
```

![](/legend.png)

# Introduction to D3

## Other Interaction Techniques

### Creating tooltips

Making tooltips from scratch is usually difficult. Similar to legends, useful libraries like d3-tip can be handy.

Import the library:

```JavaScript
import d3Tip from "d3-tip";
```

Essentially, d3-tip is creating a carefully styled HTML element block for you. You will need to customize it in the following ways when creating the tooltip:

1. Provide some style for the tooltip.
2. Make an offset so the tip is on the top.
3. Use html to set the html element you would like to display in the tooltip block. The input to the function d represents the underlying data of the mark, of which the tooltip is displaying the information.

```JavaScript
const tip: any = d3Tip()
  .attr("class", "d3-tip")
  .style("color", "white")
  .style("background-color", "black")
  .style("padding", "6px")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .offset([-10, 0])
  .html(function(d: Row) {
    return `<strong>${d3.format(",")(d.people)}</strong> people`;
  });
```

Tip: d3.format() can help you display number in a more human-friendly format. Check out more possible formats [here](https://github.com/d3/d3-format)!

Add the tooltip to the figure with call():

```JavaScript
container.call(tip);
```

We now add events listeners to the data-binded rectangle bars, such that the tooltip is triggered correctly.

Event listeners can be added to marks to react to events on the underlying selection using the on() method. The on() method takes the event name and a callback function that is triggered every time the specified event happens.

An anonymous function can be used as the callback for the event listener. The input to the function d represents the underlying data of the mark. The scope, this, corresponds to the DOM element.

Event listeners include:

+ mousedown：Triggered by an element when a mouse button is pressed down over it
+ mouseup：Triggered by an element when a mouse button is released over it
+ mouseover：Triggered by an element when the mouse comes over it
+ mouseout：Triggered by an element when the mouse goes out of it
+ mousemove：Triggered by an element on every mouse move over it.
+ click：Triggered by a mouse click: mousedown and then mouseup over an element
+ contextmenu：Triggered by a right-button mouse click over an element.
+ dblclick：Triggered by two clicks within a short time over an element

```JavaScript
chart
  .selectAll(".bar")
  .on("mouseover", function(this: HTMLElement, d: Row) {
    // show the tooltip on mouse over
    tip.show(d, this);
    // when the bar is mouse-overed, we slightly decrease opacity of the bar.
    d3.select(this).style("opacity", 0.7);
  })
  .on("mouseout", function(this: HTMLElement, d: Row) {
    // hide the tooltip on mouse out
    tip.hide();
    d3.select(this).style("opacity", 1);
  });
```

We also have to add these listeners to any bars we append in our update function (collapsed for space).

```JavaScript
function updateBetter(sex: number, step: number) {
  // ...
  // Step 3. Enter.
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (d: Row) => color(d.sex))
    .on("mouseover", function(this: HTMLElement, d: Row) {
      // show the tooltip on mouse over
      tip.show(d, this);
      // when the bar is mouse-overed, we slightly decrease opacity of the bar.
      d3.select(this).style("opacity", 0.7);
    })
    .on("mouseout", function(this: HTMLElement, d: Row) {
      // hide the tooltip on mouse out
      tip.hide();
      d3.select(this).style("opacity", 1);
    })
    .transition("enter-transition")
    .duration(500)
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people));

  // ...
}
```

Hover on the bars to see what's happening!

![](/main.png)

### Dynamic & clickable legend

Since our visualizaton is only ever showing a single sex at any given point, it'd be helpful if:

1. Our legend displayed the selected sex.
2. Users were able to use the legend as a form of input to update our visualization.

#### Displaying the selected sex

Remember that our legend was bound to the data! When we (manually) created it, we bound it to the domain of our color scale. This means we can style it according to this data (as we have with its fill).

We can make the opacity of each rect a function of the data:

```JavaScript
legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
```

And bold the text / modify its opacity similarly

```JavaScript
legend
  .selectAll(".legend-text")
  .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
  .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));
```

Our update function needs to apply these changes as well (collapsed for space).

```JavaScript
function updateBetter(sex: number, step: number) {
  // ...
  // update legend
  legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
  legend
    .selectAll(".legend-text")
    .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
    .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));

  // ...
}
```

#### Adding click events to the legend

To invoke an update when a legend item is clicked, we introduce a 'click' event listener to the legend items. When an item is clicked, we update our visualization by passing in the bound sex and a step of 0.

```JavaScript
legend.on("click", (d: number) => update(d, 0));
```

Finally, we change the cursor to be a 'pointer' over the legend.

```JavaScript
legend.style("cursor", "pointer");
```

![](/legend.png)
