### 插件会把node_module文件也处理

### 报错代码
```js
// 处理前
if (console.trace) console.trace();

// 处理后
if (console.trace) ();

// 原因：js中直接使用()会报错
// 解决：直接匹配 console.trace() 这种格式，整体删除
```

### 未知报错代码