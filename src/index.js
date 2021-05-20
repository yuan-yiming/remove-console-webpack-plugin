// 清除 console 插件
class RemoveConsolePlugin {
  // 获取用户传递的配置
  constructor(options) {
    let include = options && options.include;
    let exclude = options && options.exclude;
    let fnArr = ['log', 'warn', 'error']; // default console function

    if (!include) {
      include = [];
    } else if (!Array.isArray(include)) {
      console.error('The options "include" must be an Array.')
    }

    if (!exclude) {
      exclude = [];
    } else if (!Array.isArray(exclude)) {
      console.error('The options "exclude" must be an Array.')
    }

    // this.include = Object.keys(console).filter(fn => {
    //   return typeof console[fn] === 'function' && !exclude.includes(fn);
    // })

    // merge console function
    fnArr = [...new Set([...fnArr, ...include])]
    fnArr = fnArr.filter(fn => {
      return !exclude.includes(fn);
    })

    this.fnArr = fnArr;
  }

  // webpack 会调用 RemoveConsolePlugin 实例的 apply 方法，并传入compiler 对象
  apply(compiler) {
    /**
     * 监听事件
     * 发生 emit 事件时所有模块的转换和代码块对应的文件已经生成好，需要输出的资源即将输出
     * 因此 emit 事件是修改 Webpack 输出资源的最后时机
     */
    compiler.hooks.compilation.tap('RemoveConsolePlugin',
      compilation => {
        let assetsHandler = assets => {
          let includeStr = this.fnArr.reduce((a, b) => (a + '|' + b));

          // let re = /console\.(.+)\([^]*\)(|;)/g;
          // let re = /console\.()\(&/g;
          let re1 = RegExp(`(window\\.|)console\\.(${includeStr})\\(\\)`, 'g');
          let re2 = RegExp(`(window\\.|)console\\.(${includeStr})\\(`, 'g');

          Object.entries(assets).forEach(([filename, source]) => {
            // 拿到 js 文件
            if (/\.js$/.test(filename)) {
              source = source.source();
              let outputContent = source.replace(re1, '').replace(re2, '(');

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
        }

        // webpack 5
        if (compilation.hooks.processAssets) {
          compilation.hooks.processAssets.tap({ name: 'RemoveConsolePlugin' }, assetsHandler);
        } else if (compilation.hooks.optimizeAssets) {
          // webpack 4
          compilation.hooks.optimizeAssets.tap('RemoveConsolePlugin', assetsHandler);
        }
      })
  }
}

// 导出 Plugin
module.exports = RemoveConsolePlugin;