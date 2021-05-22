class RemoveConsoleWebpackPlugin {
  // 构造函数接受配置参数
  constructor(options) {
    let include = options && options.include;
    let removed = ['log']; // 默认清除方法

    if (include) {
      if (!Array.isArray(include)) {
        console.error('options.include must be an Array.');
      } else if (include.includes('*')) {
        removed = Object.keys(console).filter(fn => {
          return typeof console[fn] === 'function';
        })
      } else {
        removed = include;
      }
    }

    this.removed = removed;
  }

  // webpack 会调用插件实例的 apply 方法，并传入compiler 对象
  apply(compiler) {
    // js 资源代码处理函数
    let assetsHandler = (assets, compilation) => {
      let includeStr = this.removed.reduce((a, b) => (a + '|' + b));

      let re1 = RegExp(`(window\\.|)console\\.(${includeStr})\\(\\)`, 'g');
      let re2 = RegExp(`(window\\.|)console\\.(${includeStr})\\(`, 'g');

      Object.entries(assets).forEach(([filename, source]) => {
        // 匹配js文件
        if (/\.js$/.test(filename)) {
          // 处理前文件内容
          source = source.source();
          // 处理后文件内容
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

    /**
     * 通过 compiler.hooks.compilation.tap 监听事件
     * 在回调方法中获取到 compilation 对象
     */
    compiler.hooks.compilation.tap('RemoveConsoleWebpackPlugin',
      compilation => {
        // webpack 5
        if (compilation.hooks.processAssets) {
          compilation.hooks.processAssets.tap({ name: 'RemoveConsoleWebpackPlugin' },
            assets => assetsHandler(assets, compilation)
          );
        } else if (compilation.hooks.optimizeAssets) {
          // webpack 4
          compilation.hooks.optimizeAssets.tap('RemoveConsoleWebpackPlugin', assets => assetsHandler(assets, compilation));
        }
      })
  }
}

// export Plugin
module.exports = RemoveConsoleWebpackPlugin;