---
title: 条件请求和 HTTP/304 Not Modified
date: 2019-06-03 18:26:59
tags: HTTP
---

**条件请求**是客户端缓存**再验证**的检测机制，通过 HTTP 请求中特定的首部字段实现，这些首部字段规定了请求的前置条件，响应结果会因特定首部的值的不同而发生变化。**缓存再验证命中**时，服务器将返回 **HTTP/304 Not Modified** 响应。

# 再验证

缓存无法保存世界上每份文档的副本，即便可以有些文档也可能会经常发生变化。到达缓存的请求，如果缓存中有副本可以为其提供服务，这被称为**缓存命中（Cache Hit）**。其他一些到达到达缓存的请求可能会由于 没有副本可用，而被转发给原始服务器，这被称为**缓存未命中（Cache Miss）**。

![](/cache.jpeg)

缓存要不时地对其进行检测，看他们保存的副本是否仍是服务器上最新的副本。这些“新鲜度检测”被称为 **HTTP 再验证（Cache Revalidate）**。理论上，缓存可以在任意时刻，以任意的频率对副本进行再验证。但由于网络带宽限制，大部分缓存只有在客户端发起请求，并且副本旧得足以需要检测的时候，才会对副本进行再验证。

![](/304.png)

缓存再验证可能有 3 种情况：

-   **再验证命中**
    如果服务器对象未被修改，服务器会向客户端发送一个小（大概有 200 字节）的 **HTTP/304 Not Modified** 响应。

-   **再验证未命中**
    如果服务器对象与已缓存副本不同，服务器向客户端发送一条普通的、带有完整内容的 HTTP/200 OK 响应。

-   **对象被删除**
    如果服务器对象已经被删除了，服务器就会返回一个 HTTP/404 Not Found 响应，缓存也会将其副本删除。

# 条件首部

HTTP 定义了 5 个条件首部（它们都是以 If- 开头），分别为：`If-Match`，`If-None-Match`，`If-Modified-Since`，`If-Unmodified-Since`，`If-Range`。对缓存再验证来说最有用的是 `If-Modified-Since` 和 `If-None-Match`。

![](/headers.png)

`If-Modified-Since` 首部可以与 `Last-Modified` 响应首部配合工作。缓存再验证时，条件请求会包含一个 `If-Modified-Since` 首部，其中携带有最后修改已缓存副本的日期：

```JavaScript
If-Modified-Since: <cached last-modified date>
```

有些时候，仅使用 `If-Modified-Since` 是不够的。HTTP 允许用户对被称为**实体标签（ETag）**的“版本标识符”进行比较。实体标签是附加到文档上的任意标签，它们可能包含文档的序列号或版本名，或者是文档内容的校验或其他指纹信息。当发布者对文档进行修改时，可以同步修改文档的实体标签来说明这个新的版本。这样，缓存就可以利用 `If-None-Match` 条件首部对缓存进行再验证。

```JavaScript
If-None-Match: "<etag_value>"
If-None-Match: "<etag_value>", "<etag_value>", …
If-None-Match: *
```
