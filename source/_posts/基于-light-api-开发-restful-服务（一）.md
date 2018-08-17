---
title: 基于 light-api 开发 RESTful 服务（一）
date: 2018-08-17 11:16:52
tags: [Node, light-api]
---
最近基于 [light-api](https://document.lightyy.com/restapi_dev/index.html) 完成了一个服务端项目，这也是我的第一个真正意义上的服务端项目，特此记录。

# 一、理解 RESTful 架构

[Roy Fielding](https://en.wikipedia.org/wiki/Roy_Fielding) 在他2000年的博士论文 [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) 中提出了 REST（Representational State Transfer，[表现层状态转化](http://www.ruanyifeng.com/blog/2011/09/restful.html)） 软件设计架构。

用一句话概括，可以是：**客户端通过 HTTP 协议提供的 GET、POST、PUT、DELETE 四种操作方式使互联网资源在表现层发生状态变化**。

其中，资源可以是网络上以 URI（统一资源定位符）指向的任意格式的信息片段，可以是一段文本，一段视频或者一首歌曲等等，任意格式可以是 TXT，XML，JSON 等等。客户端通过 HTTP 协议提供的四种基本操作（GET 用来获取资源，POST 用来新建资源（也可以用于更新资源），PUT 用来更新资源，DELETE 用来删除资源）使的服务器上的互联网资源发生状态变化。符合这个基本原则的架构都可以称作是 RESTful 架构。

# 二、Node.js 实现动态的 GET/POST 服务

Node.js 提供了内置的 http 和 https 模块，可以非常迅速地实现 HTTP 和 HTTPS 服务。以下为一个动态 Web 服务器的基本实现：

```bash
# GET 服务
var http = require('http');
var messages = ['Hello World', 'From a basic Node.js server', 'Take Luck'];

http.createServer(function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.write('<html><head><title>Simple HTTP Server</title></head>');
  res.write('<body>');
  for(var idx in messages){
    res.write('\n<h1>' + messages[idx] + '</h1>');
  };
  res.end('\n</body></html>');
}).listen(8080);

# POST 服务
var http = require('http');
http.createServer(function(req, res){
  var jsonData = '';
  req.on('data', function(chunk){
    jsonData += chunk;
  });
  req.on('end', function(){
    var reqObj = JSON.parse(jsonData);
    var resObj = {
      message: 'Hello ' + reqObj.name,
      question: 'Are you a good ' + reqObj.occupation + '?'
    };

    res.writeHead(200);
    res.end(JSON.stringify(resObj));
  })
}).listen(8080);
```

请注意：本例中，数据被固定下来，但是在实际的项目当中，通常需要做很多的额外工作来准备数据，比如连接数据库，从数据库里获取动态数据。

不难看出，Node.js 实现 Web 服务简单至极。 `http.createServer()` 方法返回了一个 Server 对象。它提供了一个监听端口的底层套接字和接收请求，然后发送响应给客户端连接的处理程序。不过，在实际项目当中，一个完整可用的 Web 服务通常包含更多的内容，比如全局环境配置，访问授权，参数校验，路由定义与管理，数据库连接与访问，日志记录，测试和性能监控等等。

借助框架往往可以让这些工作更简单。