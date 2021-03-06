'use strict'
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') // 引入friendly-errors-webpack-plugin插件(需将其他报错提示关闭：{quiet:true})
const ip = require('ip')
const portfinder = require('portfinder')
const webpackMerge = require('webpack-merge')
const { createNotifierCallback } = require('./utils')
const { baseUrl, outputPath, openPage } = require('./config') // 引入基础配置文件
const webpackBase = require('./webpack.config.base')
const Package = require('../package.json')

// 合并配置文件
const devWebpackConfig = webpackMerge(webpackBase, {
  mode: 'development',
  devtool: 'cheap-module-source-map', // 启用 sourceMap
  devServer: {
    contentBase: outputPath, // 项目根目录,内存中的dist文件
    overlay: {
      // 错误、警告展示设置
      errors: true,
      warnings: false
    },
    quiet: true, // necessary for FriendlyErrorsPlugin
    host: '0.0.0.0',
    useLocalIp: true,
    port: Package.port,
    openPage: baseUrl ? `${baseUrl}/${openPage}` : openPage,
    inline: true,
    open: true,
    progress: false
  }
})

module.exports = new Promise((resolve, reject) => {
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // Add FriendlyErrorsPlugin
      let url = baseUrl ? `/${baseUrl}` : baseUrl
      console.log(port)

      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Your application is running here: http://${ip.address()}:${
                devWebpackConfig.devServer.port
              }${url}/${openPage}`
            ]
          },
          onErrors: createNotifierCallback()
        })
      )
      resolve(devWebpackConfig)
    }
  })
})
