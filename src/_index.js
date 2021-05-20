// 清除 console 插件
class RemoveConsolePlugin {
  // 获取用户传递的配置
  constructor(options) {
    this.options = options;
  }

  // webpack 会调用 RemoveConsolePlugin 实例的 apply 方法，并传入compiler 对象
  apply(compiler) {
    /**
     * 监听事件
     * 发生 emit 事件时所有模块的转换和代码块对应的文件已经生成好，需要输出的资源即将输出
     * 因此 emit 事件是修改 Webpack 输出资源的最后时机
     */
    compiler.hooks.emit.tapAsync('RemoveConsolePlugin',
      (compilation, callback) => {
        console.log('options => ', this.options, typeof compilation)
        // console.log('compilation => ', compilation)
        // compilation.chunks 存放所有代码块，是一个数组
        compilation.chunks.forEach(chunk => {
          // console.log('chunk => ', chunk)
          // chunk 代表一个代码块，由多个模块组成
          // 通过 chunk.forEachModule 读取每个模块
          // chunk.forEachModule(module => {
          //   console.log('module => ', module)
          //   // module 代表一个模块
          //   // module.fileDependencies 存放当前模块所有依赖的文件路径
          //   module.fileDependencies.forEach(filepath => {
          //     console.log('filepath => ', filepath)
          //   })
          // })

          // webpack 根据 chunk 生成输出的文件资源，每个 chunk 对应一个及以上的输出文件
          chunk.files.forEach(filename => {
            // 拿到 js 文件
            if (/\.js$/.test(filename)) {
              // compilation.assets 存放家境输出的资源
              // 调用 source 方法可获取即将输出资源的内容
              let source = compilation.assets[filename].source();
              // console.log('filename => ', filename, source)

              let re = /console\.(.+)\([^]*\)(|;)/g;
              let outputContent = source.replace(re, '');

              compilation.assets[filename] = {
                // 返回文件内容
                source: () => {
                  return outputContent
                },
                // 返回文件大小
                size: () => {
                  return Buffer.byteLength(outputContent, 'utf8')
                }
              }
            }

          })
        })
        callback()
      })
  }
}

// 导出 Plugin
module.exports = RemoveConsolePlugin;