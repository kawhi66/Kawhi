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
