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

作为开始，假设我们对一个给定年份（1900）和给定性别（2 = female）的人口分布感兴趣。我们可以在一个状态对象 `state` 中定义这些值，我们稍后会修改它。

```JavaScript
const state: { year: number; sex: number } = { year: 1900, sex: 2 };
```

为了过滤我们的数据到指定的集合（还记得我们对一个年份和性别感兴趣吗），我们在每一行记录上定义一个函数。回忆一下一个记录行是类似于下面的一个 JSON 对象：

```JavaScript
{ "year": 1900, "age_group": 0, "sex": 1,"people": 4619544 }
```

```JavaScript
const filteredData = data.filter(row => isYearAndSex(row, state.year, state.sex));
```

| year | age_group | sex | people |
| ---- | --------- | --- | ------ |
| 1900 | 0         | 2   | 4589196 |
| 1900 | 5         | 2   | 4390483 |
| 1900 | 10        | 2   | 4001749 |
| 1900 | 15        | 2   | 3801743 |
| 1900 | 20        | 2   | 3751061 |
| 1900 | 25        | 2   | 3236056 |
| 1900 | 30        | 2   | 2665174 |
| 1900 | 35        | 2   | 2347737 |
| 1900 | 40        | 2   | 2004987 |
| 1900 | 45        | 2   | 1648025 |
| 1900 | 50        | 2   | 1411981 |
| 1900 | 55        | 2   | 1064632 |
| 1900 | 60        | 2   | 887508  |
| 1900 | 65        | 2   | 640212  |
| 1900 | 70        | 2   | 440007  |
| 1900 | 75        | 2   | 265879  |
| 1900 | 80        | 2   | 132449  |
| 1900 | 85        | 2   | 48614   |
| 1900 | 90        | 2   | 20093   |

我们现在可以根据我们过滤得到的数据集执行一次数据绑定了。

```JavaScript
const bars = chart.selectAll(".bar").data(filteredData);
```

柱状条的选择将是一个空的 `selectAll`，因为我们还没有画任何一个。这意味着所有的数据点将在绑定的 `.enter()` 集合中。

现在，对处于 `enter` 集合中的所有数据记录，追加一个 `rect` 元素，并给定一个适当的尺寸（size）和位置（position）。可以这样想：对每一个数据点，创建一个指定属性的矩形元素。

```JavaScript
const enterbars = bars
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d: Row) => x(d.age_group))
  .attr("y", (d: Row) => y(d.people))
  .attr("width", x.bandwidth())
  .attr("height", (d: Row) => height - y(d.people))
  .attr("fill", (d: Row) => color(d.sex));
```

让我们使用我们关于 `enter()` 的知识来理解这里发生了什么。

1. `chart.selectAll('.bar')` 在 `chart` 中选择了所有带有 `bar` 类的 DOM 元素（以及它的数据绑定，如果有的话）。因为我们还没有添加任何带有 `bar` 样式类的任何元素，所以这将是一个空的元素集合。
2. `{...}.data(filteredData)` 在上面选择的空元素集合与过滤得到的数据集合之间执行了一个相当于数据连接的操作。连接的关键默认是数据集合中每一个数据项的索引。由于在这个点上，所有的数据项还没有绑定 DOM 元素，这次连接的结果首先是一个 `enter()` 集合，其中每一个数据点都包含一个数据项和一个 DOM 元素的绑定，然后是一个空的 `update()` 集合，再然后是一个空的 `exit()` 集合。
3. `.enter()` 简单地选择了 `enter()` 集合。
4. `append('rect')` 为已选集合中的每一项创建和追加了一个 DOM 元素（一个 svg 元素 `rect`）。在这里，我们为我们过滤得到的数据中的每一个记录行创建了一个 `rect` 元素。
5. `attr('class', 'bar') 再一次为每一个元素设置了属性 `class`。现在，如果我们执行一次 `.selectAll('.bar')`，我们将收到我们刚刚创建的所有元素。

每个柱状条的视觉属性按照下面的方式来计算：

+ 它的 x 的位置是一个关于数据项中指定的 `age_group` 的函数。我们之前创建了这个函数，它就是 x 比例！
+ 它的 y 的位置是一个关于人口数量的函数，由我们的 y 比例决定。
+ 它的宽度是我们的有序比例中的 `bandwidth`（也就是每一列的保留宽度）。
+ 它的高度是它在 y 方向上的起始点到图的底部（也就是 x 轴所在的位置）的距离。记住 `(0, 0)` 是我们的左上角，因此 `height` 在 y 方向上是我们的“底部”。
+ 它的填充颜色是一个关于它的数据项中指定的性别的函数，由我们的颜色比例决定。

我们的静态可视化图已经正式完成了！注意现在展示的的是指定的年份和性别的人口数据。下一节中，我们将探索如何才能把交互合并到我们的可视化图中，来允许用户修改数据中应用到的过滤方法。

<div style="width: 640px;">![](/single.png)</div>

### 使用 Update 创建一个动态的可视化图

`Update` 可以帮助我们展示在我们的可视化图中引用的数据的修改，而不需要重新全部去渲染它。这在使用过渡和动画的场景下是尤其有用的。

下面，我们实现一个单一的更新方法，这个方法执行几个步骤：

1. 它接收一个性别和 10 年的步长，过滤出数据的一个新的子集合。
2. 选择所有的 `bar` 元素并使用新的数据来连接它们（记住，由于我们没有提供明确的 `key` 方法，d3 将根据数据项的索引来连接它们）。
3. 选择 `update()` 集合，并调整每一个柱形条的属性（比如 `size`）来匹配新的数据。注意我们在这里并没有追加任何新的元素！我们简单地只是修改了这些已经存在的元素的可视化属性来匹配新的绑定到它们的数据。

`Transitions` 允许我们根据给定的过渡时间（duration）在每个柱形条的原有外观和我们刚刚指定的新的外观之间进行插入。我们可以命名一次 `transition` 来为它创建一个唯一键。拥有相同名字的过渡变化有能力彼此覆盖。

```JavaScript
function updateNaive(sex: number, step: number) {
  // Step 1
  state.year += step;
  state.sex = sex;
  const newData = data.filter(row => isYearAndSex(row, state.year, state.sex));

  // Step 2
  const bars = chart.selectAll(".bar").data(newData);

  // Step 3
  bars
    .transition("update")
    .duration(500)
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people))
    .attr("fill", (d: Row) => color(d.sex));

  const currYearNaive: any = document.getElementById("curr-year-naive");
  if (currYearNaive !== null) {
    currYearNaive.textContent = state.year;
  }
}
```

![](/dynamic.png)

```HTML
<div style="width: 800px; text-align: center; font-family: sans-serif">
  <button id="decrement">&lt;&lt;</button> <span id="curr-year-naive">--</span> <button id="increment">&gt;&gt;</button>
  <br />
  <button id="switch-sex">switch sex</button>
</div>
```

```JavaScript
const decrement: any = document.getElementById("decrement");
if (decrement !== null) {
  decrement.onclick = () => {
    if (state.year > 1900) {
      updateNaive(state.sex, -10);
    }
  };
}

const increment: any = document.getElementById("increment");
if (increment !== null) {
  increment.onclick = () => {
    if (state.year < 2000) {
      updateNaive(state.sex, 10);
    }
  };
}

const switchSexButton: any = document.getElementById("switch-sex");
if (switchSexButton !== null) {
  switchSexButton.onclick = () => {
    updateNaive(state.sex === 2 ? 1 : 2, 0);
  };
}

const currYearNaive: any = document.getElementById("curr-year-naive");
if (currYearNaive !== null) {
  currYearNaive.textContent = state.year;
}
```

我们现在可以循环选择我们的数据集的年份，并且切换性别了！






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

## Data Bindings

The data bind is a core programming paradigm in D3. A data binding is similar to a data join. In short, it's a step that makes your elements aware of the data: you can pass this data in the form of an array or object, and "bind" your data to the DOM elements you selected using methods like d3.selectAll(). This is what it looks like:

```JavaScript
d3.selectAll('<selector>').data(<data>)
```

What's happening here?

+ selectAll('<selector>') selects all DOM elements and their data bindings (if any) in a given D3 container (if we use d3.selectAll, we are looking on the entire page, if we do chart.selectAll, it'll select within the chart container). Abstractly, the result of a selection that has data bound will look something like this:

```JavaScript
[
  { id: 0, element: <DOM Element>, datum: <row from dataset> },
  { id: 1, element: <another DOM Element>, datum: <another row from dataset> }
  ...
]
```

+ .data(<data>) binds the data to the elements selected (replacing old bindings if they exist) by performing the equivalent of a database 'join' on the selection above and the data given. The key used for the join, by default, is simply the index of each datum in the data.

The result of a binding is three sets of element + data pairs.

1. enter(): The set of data that do not have bound DOM elements.
2. update()*: The set of DOM elements that already have data (* note: this is an implicit set. It is the set of elements that will be modified if neither enter() nor exit() are selected from the result of data().
3. exit(): The set of DOM elements that do not have data bound.

t may be helpful to remember the symmetry here! There is also a helpful fourth set, merge(), the union of enter() and update() sets.

To understand this paradigm, let's go through each of these sets step by step.

### Data binding 101: Recreate the legends manually with Enter

As a small first example to data binding, let's recreate the legend manually. We can do so by creating new DOM elements using the enter() set. Manual legends are just like the other elements of your visualization: by creating a new set of marks, binding the data, and using scales to style the attributes.

Programmatically, data binding goes through several steps (we will see more when we talk about interactions later):

1. select all of elements with the legend class with selectAll(). Because we haven't created any yet, the result of selectAll will be an empty set.
2. bind our data with .data() (in this case, the domain of color, which is the values of sex.)
3. Invoke enter() to work on the set of input data without a corresponding bound DOM element.
4. append() a new DOM element for every data point in the enter set. We append the g for each sex value (hence we have two).
5. Invoke attr() for each element with anonymous functions function(d, i) which are then applied to the bound data, and return values based on two parameters d (our bound datum) and i (the index of our datum). Here, we specify an offset of 20 vertical pixels between g elements.

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

Then, we can further append elements onto the wrapper group g. By appending elements onto legend, elements get automatically mapped to each datum in our color.domain(). Hence, we will have two rect elements (rectangles) in total, one for each sex. Inside the g for each sex, both rects are placed at (x=360, y=65). Recall that the two g elements have a 20 pixel offset in between them, which means we will also have a 20 pixel vertical gap between the rectangles. Think of it as an inherited padding.

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

Similarly, we can append text to create the legend labels, and set their text to be Male and Female, instead of the uninformative 1 and 2.

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

### Creating bars with Enter

Similar to how we've created the legend, let's bind our data onto elements for the bars of our visualization.

As a starting point, suppose we are interested in seeing the population distribution for a given year (1900) and sex (2 = female). We can define these values in a state object, which we will manipulate later.

```JavaScript
const state: { year: number; sex: number } = { year: 1900, sex: 2 };
```

To filter our data to specific rows of interest (recall that we are interested in a specific year and sex), we define a function on a row. Recall that a row is a JSON object that looks like the following:

```JavaScript
{ "year": 1900, "age_group": 0, "sex": 1,"people": 4619544 }
```

```JavaScript
const filteredData = data.filter(row => isYearAndSex(row, state.year, state.sex));
```

| year | age_group | sex | people |
| ---- | --------- | --- | ------ |
| 1900 | 0         | 2   | 4589196 |
| 1900 | 5         | 2   | 4390483 |
| 1900 | 10        | 2   | 4001749 |
| 1900 | 15        | 2   | 3801743 |
| 1900 | 20        | 2   | 3751061 |
| 1900 | 25        | 2   | 3236056 |
| 1900 | 30        | 2   | 2665174 |
| 1900 | 35        | 2   | 2347737 |
| 1900 | 40        | 2   | 2004987 |
| 1900 | 45        | 2   | 1648025 |
| 1900 | 50        | 2   | 1411981 |
| 1900 | 55        | 2   | 1064632 |
| 1900 | 60        | 2   | 887508  |
| 1900 | 65        | 2   | 640212  |
| 1900 | 70        | 2   | 440007  |
| 1900 | 75        | 2   | 265879  |
| 1900 | 80        | 2   | 132449  |
| 1900 | 85        | 2   | 48614   |
| 1900 | 90        | 2   | 20093   |

We can now perform a data binding on our filtered dataset.

```JavaScript
const bars = chart.selectAll(".bar").data(filteredData);
```

The bar selection will be an empty selectAll, because we have yet to draw any. This means all the data points will be in the .enter() set of the binding.

Now, for everything in the enter set, append a rect element and size / position appropriately. Think of this as: for each datapoint, create a rect with the given attributes.

```JavaScript
const enterbars = bars
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d: Row) => x(d.age_group))
  .attr("y", (d: Row) => y(d.people))
  .attr("width", x.bandwidth())
  .attr("height", (d: Row) => height - y(d.people))
  .attr("fill", (d: Row) => color(d.sex));
```

Let's use our new knowledge of enter() to understand what's going on here.

1. chart.selectAll('.bar') selects all DOM elements (and their data bindings, if any) in chart with attribute class = 'bar'. Because we have not yet added any elements with the class 'bar', this is an empty set of elements.
2. {...}.data(filteredData) performs the equivalent of a database 'join' on the the empty set selected above and the filtered data. The key used for the join, by default, is simply the index of each datum in the data. Because, at this point, all datum have no bound DOM element, the result of this join will be (a) an enter() set containing a datum + DOM bindings (present or otherwise) for every data point, (b) an empty update() set, and (c) an empty exit() set.
3. .enter() simply selects the enter() set.
4. append('rect') creates and appends a DOM element (an svg 'rect') for every item in the selected set. In this case, we are creating a rect for every row in our filteredData.
5. attr('class', 'bar'), applies the attribute class="bar" to, again, every element in our selected set. Now, if we perform a .selectAll('.bar'), we will receive all of the elements we have just created!

The visual attributes of each bar are calculated as follows:

+ Its x position is a function of the age_group of its datum d. We created this function earlier, it's the x scale!
+ Its y position is a function of the people, as determined by our y scale.
+ Its width is bandwidth of our ordinal scale (the space reserved for each column).
+ Its height is the distance between its starting y position and the 'bottom' of the chart, where the x axis lies. Remember that (0, 0) is in our top left corner, so a y position of height is our 'bottom'.
+ Its fill color is a function of the 'sex' of its datum, as determined by our color scale.

Our static visualization is officially complete! Note that this is displaying the population of a single decade and sex. In the next section, we will look at how we can incorporate interaction into our visualization to allow users to change the filter being applied to the data.

<div style="width: 640px;">![](/single.png)</div>

### Creating a dynamic visualization with Update

Update can help us display modifications to the data presented by our visualization, without needing to re-render it entirely. This is especially powerful in enabling transitions and animations.

Below, we implement a simple update function. This function performs several steps.

1. It takes a sex and a decade step (e.g. +10, -10), filters out a new subset of the data.
2. Selects all 'bar' elements and joins them with this new data (remember, because we have provided no explicit 'key' function, d3 joins on the index of the data).
3. Selects the update() set (implicitly), and adjusts the attributes of each bar (e.g. size) to match the new data. Notice that we are not appending any new elements here! We are simply changing the visual attributes of existing elements to match the new data bound to them.

Transitions allow us to interpolate between each bar's previous appearance and the new one we just specified over the given duration. We can name a transition to create a key for it. Transitions with the same name have the ability to override each other.

```JavaScript
function updateNaive(sex: number, step: number) {
  // Step 1
  state.year += step;
  state.sex = sex;
  const newData = data.filter(row => isYearAndSex(row, state.year, state.sex));

  // Step 2
  const bars = chart.selectAll(".bar").data(newData);

  // Step 3
  bars
    .transition("update")
    .duration(500)
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people))
    .attr("fill", (d: Row) => color(d.sex));

  const currYearNaive: any = document.getElementById("curr-year-naive");
  if (currYearNaive !== null) {
    currYearNaive.textContent = state.year;
  }
}
```

![](/dynamic.png)

```HTML
<div style="width: 800px; text-align: center; font-family: sans-serif">
  <button id="decrement">&lt;&lt;</button> <span id="curr-year-naive">--</span> <button id="increment">&gt;&gt;</button>
  <br />
  <button id="switch-sex">switch sex</button>
</div>
```

```JavaScript
const decrement: any = document.getElementById("decrement");
if (decrement !== null) {
  decrement.onclick = () => {
    if (state.year > 1900) {
      updateNaive(state.sex, -10);
    }
  };
}

const increment: any = document.getElementById("increment");
if (increment !== null) {
  increment.onclick = () => {
    if (state.year < 2000) {
      updateNaive(state.sex, 10);
    }
  };
}

const switchSexButton: any = document.getElementById("switch-sex");
if (switchSexButton !== null) {
  switchSexButton.onclick = () => {
    updateNaive(state.sex === 2 ? 1 : 2, 0);
  };
}

const currYearNaive: any = document.getElementById("curr-year-naive");
if (currYearNaive !== null) {
  currYearNaive.textContent = state.year;
}
```

We can now cycle through the decades of our dataset and switch the filtered sex!
