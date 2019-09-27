# babel-plugin-rmodel

>  
> 
## 设计动机
&nbsp;&nbsp;&nbsp;&nbsp;本人在后台管理项目中使用vue比较多，私以为v-model是一个很好的语法糖，可以有效地减少了编写表单控件的输入处理的代码。后台管理详情页面中常用到大量的输入控件，比如商品详情页面，往往包含几十个字段的展示与编辑。react并没有在架构代码中提供类似与vue中v-model的功能，要实现相同的功能就要手动编写大量的onChange处理方法。前端的发展历程，往往很多时候是为了优雅地减少前端工程师的工作量。为了在react中能使用类似与vue的v-model这种双向绑定的语法糖，我特意写了这个babel插件，在编译的过程中自动的对代码进行转换。   

&emsp;
## example:
### 编写如下代码：
```javascript
class App extends React.Component {
  constructor () {
    super();
    this.state = {
      inputVal: 8
    }
  }
  render () {
    return (
      <div className="App">
        <p>{this.state.inputVal}</p>
        <input rModel={this.state.inputVal}/>
      </div>
    );
  } 
}
```
### 相当于如下代码
```javascript
class App extends React.Component {
  constructor () {
    super();
    this.state = {
      inputVal: 8
    }
  }
  render () {
    return (
      <div className="App">
        <p>{this.state.inputVal}</p>
        <input 
            value={this.state.inputVal} 
            onChange={
                e => {
                    let val = e.target.value;
                    this.setState(state => ({inputVal:val}))
                }
            }
        />
      </div>
    );
  } 
}
```


&emsp;
## NPM 安装
```bash
npm i --save-D babel-rmodel-plugin
```
&emsp;

## 如何使用
### 请参考babel的preset的使用方法与插件的使用方法
### preset: https://babeljs.io/docs/en/presets
### plugin: https://babeljs.io/docs/en/plugins

### 如果你用create-react-app建立的工程，你可以修改package.json文件和webpack.config.js文件
#### package.json在presets的react-app前添加一行代码
```json
"babel": {
    "presets": [
+       {"plugins": ["babel-plugin-rmodel"]},
        "react-app"
    ]
  },
```
#### webpack.config.js在babel-loader的plugins中添加一行代码
```javascript
{
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
    customize: require.resolve(
        'babel-preset-react-app/webpack-overrides'
    ),
    
    plugins: [
        [
        require.resolve('babel-plugin-named-asset-import'),
        {
            loaderMap: {
            svg: {
                ReactComponent:
                '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
            },
        },
+       require.resolve('babel-plugin-rmodel'),
        ],
    ],
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
    // See #6846 for context on why cacheCompression is disabled
    cacheCompression: false,
    compact: isEnvProduction,
    },
}
```
