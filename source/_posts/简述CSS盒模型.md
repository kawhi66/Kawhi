---
title: 简述CSS盒模型
date: 2018-09-12 20:39:42
tags: [每天一道面试题, CSS]
---

当对一个文档进行布局的时候，浏览器渲染引擎会根据 *Css - Box* 模型（*CSS Basic Box model*）将所有元素表示为一个矩形盒子（*box*)。CSS 使用标准盒模型描述这些矩形盒子中的每一个，这个模型描述了元素所占空间的内容。

盒模型由外到内包括：边距（**margin**），边框（**border**），填充（**padding**）和内容（**content**）。在标准盒模型中，元素在页面中所占的宽度是上述四个部分宽度之和。

盒模型有**标准盒模型**和** IE 盒模型**两种，可以通过** box-sizing **属性切换，**box-sizing **默认值为** content-box**，表示标准盒模型，设置为** border-box **可以设置为 IE 盒模型。标准盒模型和 IE 盒模型的不同之处在于** content 内容的大小**，IE 盒模型中，内容大小包括了填充（padding）和边框（border）。

&nbsp;

**相关问题：**

> [外边距合并/外边距重叠/ margin 越界](/2018/09/13/外边距合并现象/)
> javaScript 获取和设置元素尺寸
> 块格式化上下文（Block Formatting Context，BFC）

&nbsp;