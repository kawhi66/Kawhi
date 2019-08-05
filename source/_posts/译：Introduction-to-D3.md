---
title: 译：Introduction to D3
date: 2019-08-02 09:44:05
tags: 外文翻译
---

介绍 D3。

# 关于作者

![](/Halden Lin, Tongshuang Wu.png)

[Halden Lin](https://haldenl.com)，[Tongshuang (Sherry) Wu](http://homes.cs.washington.edu/~wtshuang/)，[华盛顿大学交互数据实验室](https://idl.cs.washington.edu)。

# d3.js 是什么

D3 是一个用于数据可视化的 JavaScript 库。D3 的核心范式是绑定数据到网页中的 DOM 元素，从而驱动这些元素的内容和表现，因此叫做数据驱动文档（Data-Driven Documents）。

# 我们将构建什么

这里是这篇文章将会构建的可视化数据的快览。

<div style="width: 640px;">![](/main.png)</div>

```JavaScript
// TODO: 数据模型
```

# 数据

想实现可视化，我们需要一些数据。

每隔十年，人口统计局会记录美国的人口特征，这将影响从国会选区到社区服务的方方面面。我们将以一份包含从 1900 年到 2000 年整整一个世纪的持续两年的高水平人口统计数据集合来工作。

这份数据是描述美国人口的一个 JSON 格式的列表，它包含来下面的列：

+ year：人口统计的年份。
+ age_group：年龄组，以 5 年为一组，最小是 0-4 岁，最大是 90+ 岁。
+ sex：性别（在这份数据集中是二进制的）：1 指男性，2 指女性。
+ people：当前年龄组的人口数量。

这里是前十行的数据：

| year | age_group | sex | people |
| ---- | --------- | --- | ------ |
| 1900 | 0         | 1   | 4619544 |
| 1900 | 0         | 2   | 4589196 |
| 1900 | 5         | 1   | 4465783 |
| 1900 | 5         | 2   | 4390483 |
| 1900 | 10        | 1   | 4057669 |
| 1900 | 10        | 2   | 4001749 |
| 1900 | 15        | 1   | 3774846 |
| 1900 | 15        | 2   | 3801743 |
| 1900 | 20        | 1   | 3694038 |
| 1900 | 20        | 2   | 3751061 |

现在，让我们开始编码吧！

# 引入依赖

首先，我们需要引入 d3。

```JavaScript
import * as d3 from "d3";
```

# 创建和追加元素

首先，让我们创建一个容器来保存我们将要增加的可视化元素。

要创建我们的容器，首先要定义可视化区域的宽度，高度，还有边距。我们期望我们的可视化区域范围限定在我们指定的宽度和高度内，我们指定的边距用来保存诸如坐标轴和标题之类的元素。

```JavaScript
const width: number = 600;
const height: number = 400;
const margin: { top: number; right: number; bottom: number; left: number } = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 100
};
```

我们的闭合容器将会是一个 svg，或者叫做可伸缩矢量图形（Scalable Vector Graphics）元素。我们可以通过使用 d3 的 `create` 方法来创建。

```JavaScript
const container: any = d3
  .create("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
```

注意我们已经指定属性到我们刚刚创建的元素。对于一份完整的可指定到 svg 元素的属性列表，可以查看这里的[文档](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute)。

在这个容器内部，我们可以插入我们的图表。为了实现这一目的，我们创建了一个 `group` 元素，这个元素在我们的容器内部是经过位移处理的，用来实现我们的边距。这也是我们的可视化数据绑定的图形元素所处的位置。

我们使用 `append()` 方法添加这个创建的 `g`，它允许我们在任何地方添加新的元素。我们也能使用 `remove()` 方法来删除元素。

为了以后使用，我们用一个变量来保存 `chart`。

```JavaScript
const chart: any = container
  .append("g")
  .attr("id", "chart")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
```

# 选择器（Selections）

`append()` 方法是 d3 选择器家庭中的一部分，它用来帮助我们创建和访问页面元素。

`d3.select()` 和 `d3.selectAll()` 能够通过 `name`，`class`，`id` 或者很多其他的 [CSS 选择器（selectors）](https://www.w3schools.com/cssref/css_selectors.asp)来访问元素。`d3.select()` 方法仅选择匹配 CSS 选择器的第一个元素，而 `d3.selectAll()` 方法选择所有匹配的元素。要想在一个我们已经定义的已选元素（例如我们的 `container` 或者 `chart`）内部选择一个元素，我们可以使用 `selection.select()` 或者 `selection.selectAll()`。

你可以使用 `attr()`，`text()`，`style()` 以及其他的操作器（operators）访问和修改已选元素的属性。大部分 d3 用来选择元素的方法返回的仍然是已选的元素，这可以使我们链接操作器方法的调用。

小贴士
> [d3 selections](https://github.com/d3/d3-selection) 非常有用
> 牢记元素定位的原点是在左上角

# 域（Domains）

在我们开始绘制我们的数据之前，我们首先需要为我们的柱形图定义我们的 x 轴，y 轴和颜色域以及比例。

年龄域。这会生成所有数据中年龄的一个数组。`array.map` 根据给定的方法（在我们的场景中，我们想要一个只有年龄的数组），通过映射原始数组中的数据到新的数组，最终返回一个尺寸完全相同的数组。我们定义了一个工具方法 `unique` 来帮助我们去重。

```JavaScript
const ageDomain: Array<any> = unique(data.map(row => row.age_group));
```

人口域。我们想要最小值为 0，因为这是一个柱状图，最大值取所有数据中最大的人口数量。我们传递一个方法来告诉 `d3.max` 如何根据给定的数据记录获取人口数量。

```JavaScript
const peopleDomain: Array<any> = [0, d3.max(data, row => row.people)];
```

性别域。在我们的数据中，性别列将男性编码为 1，女性编码为 2，因此我们能直接使用他们作为域。

```JavaScript
const sexDomain: Array<any> = [1, 2];
```

# 比例（Scales）

使用这些域，我们现在可以为我们的编码定义比例了。

正如你以及学到的，比例是表示从一个域到一个范围（图表的域）的映射关系的方法。d3 有多个内建的比例方法。在构建真正的比例方法之前，让我们看看我们将会用到的几种描述比例的方法：

+ `d3.scaleLinear()` 在一个连续的域和范围之间创建一个线性的映射关系。我们也使用 `d3.scaleLog()`，`d3.scaleSqrt()` 等等。
+ `d3.scaleOrdinal()` 指定从一系列有序，离散的数据到一系列对应的可视化属性（比如颜色）的一个明确的映射关系。
+ `d3.scaleBand()` 映射一个离散的域到一个连续的范围，通过分割连续的范围到等量的段（bands）。等量比例（band scales）常常用在有一个有序的或者有特定纬度的柱状图，就像我们的年龄域。

我们想要在 x 轴上展示年龄。我们使用一个有序的比例来匹配数据。范围（range）表示在可视化中的界限，而域（domain）表示在数据中的界限。再次调用比例方法，接收一个域中的值，映射出它在可视化范围中的值。

```JavaScript
const x = d3
  .scaleBand()
  .rangeRound([0, width])
  .padding(0.1)
  .domain(ageDomain);
```

相似地，我们想要一个定量的 `y` 比例来描述人口的数量。我们这里的范围是从 `height` 到 0（0 到 `height` 的相反范围），因为在 HTML/d3 领域，内容是向下来画的，(0, 0) 所在的位置是左上角。

```JavaScript
const y = d3
  .scaleLinear()
  .range([height, 0])
  .domain(peopleDomain);
```

我们用颜色编码性别。我们先定义了分别代表男性和女性的颜色，用来作为一个有序比例的范围。

```JavaScript
const maleColor = "#42adf4";
const femaleColor = "#ff96ca";
const color = d3
  .scaleOrdinal()
  .range([maleColor, femaleColor])
  .domain(sexDomain);
```

额外的小贴士：D3 也能处理时间比例，比如 `d3.scaleTime()`，并且包含默认的颜色比例，像 `d3.schemeCategory10()`。查看 [d3js Scales](https://github.com/d3/d3-scale) 获取更多的信息。

# 坐标轴（Axes）

比例定义好之后，我们可以添加相应的坐标轴到我们的 svg 容器。

坐标轴在可视化中可以依据比例生成。坐标轴是基于他们的位置，使用坐标轴生成方法 `d3.axisTop()`，`d3.axisBottom()`，`d3.axisRight()` 或者 `d3.axisLeft()` 定义的。

要创建一个坐标轴，我们必须创建或选择我们想要放置的元素，然后执行已选元素的 `call()` 方法来应用我们的坐标轴生成方法。

查看 [d3 Axes](https://github.com/d3/d3-axis) 查看更多的信息。

```JavaScript
const xaxis = chart
  .append("g")
  .attr("class", "axis axis--x")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x));

const yaxis = chart
  .append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y));
```

# 标题（Titles）

在 D3 中，坐标轴生成方法不会自动为你创建标题。你可以通过添加 `text` 标签手动添加 `labels` 到你的坐标轴（或者其他元素！）。对于其他别的标签，你可以编程式地指定 HTML 属性和 CSS 样式。

让我们给这个图添加标题，还有 x 轴和 y 轴的：

```JavaScript
container.selectAll("text").style("font-family", "sans-serif");
const title: any = container
  .append("text")
  .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, 20)`)
  .style("text-anchor", "middle")
  .style("font-weight", 700)
  .text("Census Age Group and Population by Sex");
const ytitle: any = chart
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Population");
const xtitle: any = chart
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
  .style("text-anchor", "middle")
  .text("Age Group");
```

# 图例（Legends）

相似地，你也需要构造图例。[d3-Legend](https://d3-legend.susielu.com/#summary) 库可以用来帮助自动创建它：

```JavaScript
const legend_auto: any = d3Legend
  .legendColor()
  .labels(["Male", "Female"])
  .scale(color);
 ```

 和坐标轴相似，我们可以调用 `call()` 方法添加图例：

 ```JavaScript
 container
   .append("g")
   .attr("class", "legend_auto")
   .style("font-size", 12)
   .style("font-family", "sans-serif")
   .attr("transform", "translate(650, 100)")
   .call(legend_auto);
  ```

看一下我们的包含坐标轴标题和颜色图例的容器：

![](/frame.png)

既然我们已经设置好了我们图的框架，让我们开始处理真实的数据吧！
