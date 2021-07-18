module.exports = {
  // 应用 id
  id: "36ccede0-e772-11eb-8ec0-99acd93568fa",
  // 应用类型
  type: "app",
  // 打开之后将使用内置的路由引擎，自动处理路由关系，否则需要手动设置路由
  autoRouting: false,
  // 设置路由前缀，通常用于部署到非根目录
  base: "/",
  // 配置路由模式
  mode: "history",
  // 插件
  plugins: [],
  // 代理
  proxy: {},
  // 设置静态资源文件打包时的相对路径
  publicPath: "/",
  // 部署配置
  see: {
    // 系统类型
    systemType: "HUI",
  },
  // 使用 Vuex 进行状态管理
  vuex: false
};
