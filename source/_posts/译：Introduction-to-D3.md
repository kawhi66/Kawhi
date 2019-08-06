---
title: 译：Introduction to D3
date: 2019-08-02 09:44:05
tags: 外文翻译
---

介绍 D3。

# 关于作者

![](/Halden Lin, Tongshuang Wu.png)

[Halden Lin](https://haldenl.com)，[Tongshuang (Sherry) Wu](http://homes.cs.washington.edu/~wtshuang/)，[华盛顿大学交互数据实验室](https://idl.cs.washington.edu)。

# 介绍 D3

## d3.js 是什么

[D3](https://d3js.org/) 是一个用于数据可视化的 JavaScript 库。D3 的核心范式是绑定数据到网页中的 DOM 元素，从而驱动这些元素的内容和表现，因此叫做数据驱动文档（Data-Driven Documents）。

## 我们将构建什么

这里是这篇文章将会构建的可视化数据的快览。

<div style="width: 640px;">![](/main.png)</div>

```JavaScript
// TODO: 数据模型
```

## 数据

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

## 引入依赖

首先，我们需要引入 d3。

```JavaScript
import * as d3 from "d3";
```

## 创建和追加元素

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

## 选择器（Selections）

`append()` 方法是 d3 选择器家庭中的一部分，它用来帮助我们创建和访问页面元素。

`d3.select()` 和 `d3.selectAll()` 能够通过 `name`，`class`，`id` 或者很多其他的 [CSS 选择器（selectors）](https://www.w3schools.com/cssref/css_selectors.asp)来访问元素。`d3.select()` 方法仅选择匹配 CSS 选择器的第一个元素，而 `d3.selectAll()` 方法选择所有匹配的元素。要想在一个我们已经定义的已选元素（例如我们的 `container` 或者 `chart`）内部选择一个元素，我们可以使用 `selection.select()` 或者 `selection.selectAll()`。

你可以使用 `attr()`，`text()`，`style()` 以及其他的操作器（operators）访问和修改已选元素的属性。大部分 d3 用来选择元素的方法返回的仍然是已选的元素，这可以使我们链接操作器方法的调用。

小贴士
> [d3 selections](https://github.com/d3/d3-selection) 非常有用
> 牢记元素定位的原点是在左上角

## 域（Domains）

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

## 比例（Scales）

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

## 坐标轴（Axes）

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

## 标题（Titles）

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

## 图例（Legends）

相似地，你也需要构造图例。[d3-Legend](https://d3-legend.susielu.com/#summary) 库可以用来帮助自动创建它：

```JavaScript
const legend_auto: any = d3Legend
  .legendColor()
  .labels(["Male", "Female"])·
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

<div style="width: 720px;">![](/frame.png)</div>

既然我们已经设置好了我们图的框架，让我们开始处理真实的数据吧！

## 数据绑定（Data Bindings）

数据绑定在 D3 中是一个核心的编程范式。数据绑定（data binding）和数据连接（data join）类似。简言之，它是使你的元素知道你的数据的一个过程：你可以以数组或者对象的方式传递数据，然后绑定到使用像 `d3.selectAll()` 之类的方法选择的 DOM 元素上。它看上去是这样的：

```JavaScript
d3.selectAll('<selector>').data(<data>)
```

这里发生了什么？

+ `selectAll('<selector>')` 在一个给定的 D3 容器中（如果我们使用 `d3.selectAll`，我们查找的是整个页面，如果我们使用 `chart.selectAll`，它将在 `chart` 容器内选择）选择所有的 DOM 元素和他们的数据绑定（如果有的话）。理论上，包含数据绑定的已选元素的结果看上去像是这样：

```JavaScript
[
  { id: 0, element: <DOM Element>, datum: <row from dataset> },
  { id: 1, element: <another DOM Element>, datum: <another row from dataset> }
  ...
]
```

+ `.data(<data>)` 相当于通过在上面的已选元素和给定的数据之间执行数据连接来绑定数据到已选元素（如果它们存在的话就取代旧的数据绑定）。默认地，连接的关键是数据中的每个数据项的索引。

一个绑定的结果是**三个元素 + 数据对集合**。

1. `enter()`：没有绑定 DOM 元素的数据集合。
2. `update()`：已经有数据的 DOM 元素集合（注意：这是一个隐含的集合。它是这样的一组元素，如果 `data()` 的结果既没有 `enter()`，也没有 `exit()`，那么它们将会被修改）。
3. `exit()`：没有数据绑定的元素集合。

记住这里的对称性可能是有用的！还有**第四个元素 + 数据对集合** `merge()` 也是有用的，它是 `enter()` 和 `update()` 的结合。

要想理解这个范式，让我们一步一步过一遍这些集合。

### 数据绑定：用 Enter 重新手动创建图例

作为一个数据绑定的第一个小例子，让我们重新手动创建图例。我们可以通过使用 `enter()` 集合创建新的 DOM 元素来做到。手动创建的图片和你的可视化图中的其他元素是类似的：通过创建一组新的标签，绑定数据，使用比例来处理属性。

以编程的方式，数据绑定需要结果几个步骤（晚点儿当我们谈到交互的时候会看到更多）：

1. 使用 `selectAll()` 选择带有 `legend` 类的所有元素。因为我们还没有创建， `selectAll` 的结果将会是一个空的集合。
2. 使用 `.data()` 绑定我们的数据（在这里是颜色域，也就是性别的值）。
3. 在还没有绑定 DOM 元素的输入数据上执行 `enter()` 。
4. 在 enter 集合中对每一个数据点 `append()` 一个新的 DOM 元素。我们对每个性别值追加了 `g` 元素（因此我们有两个）。
5. 对每个元素执行带有匿名函数的 `attr()` 方法，这个匿名函数会应用在绑定的数据上，然后返回两个参数 `d`（我们绑定的数据项） 和 `i`（数据项的索引）。这里我们在 `g` 元素之间指定了一个 20 像素的垂直间距。

```JavaScript
const legend: any = chart
  .selectAll(".legend")                    // step 1
  .data(color.domain())                    // step 2
  .enter()                                 // step 3
  .append("g")                             // step 4
  .attr("class", "legend")                 // step 5
  .attr("transform", function(i: number) { // step 5
    // i 是索引
    return `translate(0, ${i * 20})`;
  })
  .style("font-family", "sans-serif");
```

然后，我们可以进一步在组元素 `g` 中追加元素。通过在图例中追加元素，元素可以自动映射到颜色域中的每一个数据项。因此，我们将会有两个矩形元素（rectangles），每一个代表一种性别。在代表每个性别的 `g` 元素内部，两个矩形都以（x=360,y=65）定位。回忆一下在连个 `g` 元素之间有 20 像素的上下间距，意味着在两个矩形之间也有 20 像素的垂直间距。可以把它想成一个继承的间距。

```JavaScript
legend
  .append("rect")
  .attr("class", "legend-rect")
  .attr("x", width + margin.right - 12)
  .attr("y", 65)
  .attr("width", 12)
  .attr("height", 12)
  .style("fill", color);
```

相似地，我们可以追加 `text` 来创建图例标签，并且设置它们的文本为 `Male` 和 `Female`，取代没有意义的 1 和 2。

```JavaScript
legend
  .append("text")
  .attr("class", "legend-text")
  .attr("x", width + margin.right - 22)
  .attr("y", 70)
  .style("font-size", "12px")
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d: number) {
    return d === 1 ? "Male" : "Female";
  });
```

<div style="width: 640px;">![](/legend.png)</div>

### 用 Enter 创建柱形条

和我们已经创建的图例相似，让我们为我们的可视化数据的柱形条绑定数据到元素。



# Introduction to D3

## What is d3.js?

[D3](https://d3js.org/) is a JavaScript library for data visualization. The core paradigm of D3 is to bind data to Document Object Model (DOM) elements of a web page in order to drive the content and appearance of those elements: hence Data-Driven Documents!

## What we'll be building

Here's a sneak peek of the visualization we'll be creating in this notebook.

<div style="width: 640px;">![](/main.png)</div>

```JavaScript
// TODO
```

## Data

To create a visualization, we need some data!

Every 10 years, the census bureau documents the demographic make-up of the United States, influencing everything from congressional districting to social services. We will work with a dataset that contains a high-level summary of census data for two years a century apart: 1900 and 2000.

The data is a JSON list that describes the U.S. population, It consists of the following columns:

+ year: The year of the census.
+ age_group: Age group, in 5 year bins from 0-4 years old to 90+.
+ sex: The reported sex (binary in this dataset): 1→male, 2→female.
+ people: The population count of the group.

Here are the first 10 rows:

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

Now, let's start coding!

## Imports

First, we need to import d3. The suffix @5 here denotes version 5.

```JavaScript
import * as d3 from "d3";
```

## Create and Append

First, let's create a container to hold the visual elements that we are going to add.

To create our container, we first define the width, height, as well as margins for our visualization. We expect the dimensions of our visualization to be width by height, with surrounding margin for elements such as axes and titles.

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

Our enclosing container will be an svg, or Scalable Vector Graphics, element. We can create this by using d3's create method. Notice the mutable qualifier here. Don't freak out! This is discussed above "A quick note about the code..." and is not necessary for your own work.

```JavaScript
const container: any = d3
  .create("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
```

Notice that we've assigned attr (attributes) to the element we've just created. For a full list of attributes assignable to svg elements, check out the documentation here.

Within this container, we can insert our chart. To do this, we create a g element (a "group"), which is translated within our container such that we achieve our margin. This is where the graphical elements bound to the data of our visualization will lie.

We add the created g using the append() function – it allows us to add new elements anywhere. We can also get rid of elements with remove().

We store chart with a variable for future use.

```JavaScript
const chart: any = container
  .append("g")
  .attr("id", "chart")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
```

## Selections

append() is part of the d3 selection family, which helps to create and access page elements.

d3.select() and d3.selectAll() can be used to access elements by name, class, id, or many other [CSS selectors](https://www.w3schools.com/cssref/css_selectors.asp). d3.select() selects only the first element that matches the CSS selectors while d3.selectAll() selects all matched elements. To select an element within a selection we've already defined (e.g., our container or chart) we can use selection.select() or selection.selectAll().

You can access and modify the properties of selections with attr(), text(), style(), and other operators. Most d3 selection methods return the selection, allowing us to chain the operator calls.

Tips
> The [d3 selections page](https://github.com/d3/d3-selection) is extremely helpful!
> Keep in mind that the origin for positioning elements is the upper left corner!

## Domains

Before we can begin plotting our data, we first need to define our x, y and color domains and scales for our bar chart.

*Age Domain*. This produces an array of all the ages in the data. array.map returns an array of identical length by mapping values in the original array to new ones, decided by the given function (in our case, we want an array of just ages). We defined a helper function unique that will give us the unique values.

```JavaScript
const ageDomain: Array<any> = unique(data.map(row => row.age_group));
```

*People Domain*. We want the minimum to be 0, as this is a bar chart, and the maximum to be the maximum people count in the data. We pass a function to tell d3.max how to access the people count given a data record.

```JavaScript
const peopleDomain: Array<any> = [0, d3.max(data, row => row.people)];
```

*Sex domain*. The sex column in our data codes male as 1 and female as 2, and so we can just use them directly as the domain.

```JavaScript
const sexDomain: Array<any> = [1, 2];
```

## Scales

Using these domains, we can now define scales for our encoding channels.

As you have learned with Vega-Lite / Altair, scales are functions that map from a domain to a range (a domain of chart). d3 has multiple built in scale functions. Before building the actual scale function, let's take a look at the type of functions we are going to use:

+ d3.scaleLinear() creates a linear mapping between a continuous domain and range. We also have d3.scaleLog(), d3.scaleSqrt(), and so on.
+ d3.scaleOrdinal() specifies an explicit mapping from a set of ordered, discrete data values to a corresponding set of visual attributes (such as colors).
+ d3.scaleBand() maps a discrete domain to a continous range, by dividing the continous range into uniform bands. Band scales are often used for bar charts with an ordinal or categorical dimension – just like our age field!

We want to visualize age on the x-axis. We use an ordinal scale to match the data. range denotes the bounds in the visualization, and domain denotes the bounds in the data. Recall that scales are functions that take a domain value, i.e., age, and map it to a visual range value, i.e., position: x = f(age) => position.

```JavaScript
const x = d3
  .scaleBand()
  .rangeRound([0, width])
  .padding(0.1)
  .domain(ageDomain);
```

Similarly, we want a quantitative y scale for population count. Our range here is from height to 0 (as opposed to 0 to height) because in HTML/d3 land things are drawn downward, where (0, 0) is the top-left corner.

```JavaScript
const y = d3
  .scaleLinear()
  .range([height, 0])
  .domain(peopleDomain);
```

We encode sex with colors. We first define the the colors representing the male and female, and use those as the range of an ordinal scale.

```JavaScript
const maleColor = "#42adf4";
const femaleColor = "#ff96ca";
const color = d3
  .scaleOrdinal()
  .range([maleColor, femaleColor])
  .domain(sexDomain);
```

*Additional tips:* D3 also handles temporal scales like d3.scaleTime(), and contains default color scales like d3.schemeCategory10() (so you don't have to manually define colors, as in our case). Check out the [d3js Scales page](https://github.com/d3/d3-scale) for more information.

## Axes

With scales defined, we can add corresponding axes to our svg container.

Axes can be generated based on the scales in your visualization. Axes are defined based on their position using axis generator functions d3.axisTop(), d3.axisBottom(), d3.axisRight(), or d3.axisLeft().

To create an axis, we must create or select the element in which we want to place it, then invoke the selection call() method to apply our axis generator function to it.

See the [d3 Axes page](https://github.com/d3/d3-axis) for more information.

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

## Titles

In D3, axis generators do not automatically create titles for you. You can manually add labels to your axes (or other elements!) by adding text marks. As with any other mark, you can programmatically specify both HTML attributes and CSS styles.

Let's add titles for the chart, and x and y axes:

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

## Legends

Similarly, you will also need to construct legends. The [d3-legend](https://d3-legend.susielu.com/#summary) library can be used to help automatically create it:

```JavaScript
const legend_auto: any = d3Legend
  .legendColor()
  .labels(["Male", "Female"])·
  .scale(color);
 ```

 Similar to axes, we can then add the legend with the call function:

 ```JavaScript
 container
   .append("g")
   .attr("class", "legend_auto")
   .style("font-size", 12)
   .style("font-family", "sans-serif")
   .attr("transform", "translate(650, 100)")
   .call(legend_auto);
  ```

Take a look at our container with the axis titles and the color legend:

<div style="width: 720px;">![](/frame.png)</div>

Now that we've setup the frame of our chart, let's start to deal with the real data!
