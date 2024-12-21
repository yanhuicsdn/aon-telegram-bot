const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/v1'
        }
      }
    }
  }
})
