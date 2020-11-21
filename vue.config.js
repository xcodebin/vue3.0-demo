let moduleName = process.argv[3]
let path = require('path')
let glob = require('glob')
const chalk = require('chalk');
const AutoDllPlugin = require('autodll-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

function resolve(dir) {
	return path.join(__dirname, dir)
}

//配置pages多页面获取当前文件夹下的html和js
function getEntry(globPath) {
	let entries = {}, tmp, modules, moduleName, moduleIndexHtml;
	glob.sync(globPath).forEach(entry => {
		tmp = entry.split('/').splice(-3)
		modules = tmp[0];
		moduleName = tmp[1];
		moduleIndexHtml = tmp[2];
		entries[moduleName] = {
			entry: `src/${modules}/${moduleName}/main.ts`,
			template: `src/${modules}/${moduleName}/${moduleIndexHtml}`,
			title: moduleIndexHtml,
			filename: process.env.NODE_ENV !== 'production'
				? `${moduleName}.html`
				: `${moduleName}/${moduleIndexHtml}`
		};
	});
	return entries;
}

let pages = getEntry(`./src/modules/${moduleName || '**'}/*.html`);
let moduleKeys = Object.keys(pages).map(key => key)
// console.log(chalk.yellow(`${process.argv}`))
if (process.argv[3] && !moduleKeys.includes(process.argv[3])) {
	console.log(chalk.yellow(`[${process.argv[3]}]模块没有找到，无法进行构建`))
	return
}
//配置end

module.exports = {
	lintOnSave: process.env.NODE_ENV !== 'production', // 禁用eslint,
	publicPath: process.env.NODE_ENV !== 'production' ? '/' : './',
	outputDir: 'dist',
	productionSourceMap: process.env.NODE_ENV !== 'production',
	pages,
	devServer: {
		index: 'module1', //默认启动serve 打开page1页面
		open: false,
		// host: 'localhost',
		port: 8088,
		https: false,
		hotOnly: false,
		proxy: {
			'/api': {
				target: 'http://reg.tool.hexun.com/',
				changeOrigin: true,
				pathRewrite: {
					'^/api': ''
				}
			}
		},
		before: app => {
		}
	},
	chainWebpack: config => {
		config.module
			.rule('images')
			.use('url-loader')
			.loader('url-loader')
			.tap(options => {
				// 修改它的选项...
				options.limit = 100
				return options
			})

		config.resolve.alias
			.set('@', resolve('src')) // 配置模块路径公共变量
			.set('@module1', resolve('src/modules/module1'))
			.set('@module2', resolve('src/modules/module2'))

		Object.keys(pages).forEach(entryName => {
			config.plugins.delete(`prefetch-${entryName}`);
		});

		if (process.env.NODE_ENV === 'production') {
			config.plugin('extract-css').tap(() => [{
				path: path.join(__dirname, `./dist/`),
				filename: 'css/[name].[contenthash:8].css'
			}]);
		}
	},
	configureWebpack: config => {
		let pluginsDev = [
			new AutoDllPlugin({
				inject: true, // will inject the DLL bundle to index.html
				debug: true,
				filename: 'dll.[name].[contenthash:8].js',
				path: './dll',
				entry: {
					vendor: ['vue', 'vue-router', 'vuex', 'vue-i18n']
				}
			}),
			new HardSourceWebpackPlugin(),
		]
		config.plugins = [...config.plugins, ...pluginsDev]
	},
}