"use strict";

var path = require("path");
var webpack = require("webpack");
//var HappyPack = require('happypack');
var deepAssign = require("deep-assign");
var WebpackShellPlugin = require("./plugins/WebpackShellPlugin");
var TimerUtil = require("./lib/utils/TimerUtil").default;
var rootPath = path.resolve(__dirname, path.relative(__dirname,''));
var bundle = {
	bundle: [
		'babel-polyfill',
		'webpack-hot-middleware/client',
		'./src/client/index.js'
	],
	en:['./src/client/locales/en/en.js'],
	zhTW: ['./src/client/locales/zhTW/zhTW.js']
};
var isEchoStart = false;
var isEchoEnd = false;

module.exports = function webpackDevConfigMain(config) {
	return deepAssign({
		debug: true,
		context: rootPath,
		devtool: 'eval',
		entry: bundle,			
		resolve: {
			root: [ rootPath ],
			extensions: ["", ".js", ".jsx"]
		},
		output: {
			path: path.join(rootPath, '/public/build/'),
			publicPath: '/build',
			filename: config.name + '_[name].js',
			libraryTarget: 'var',
			library: config.name + '_[name]'
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: "window.env"
				}
			}),
			/*new HappyPack({
	      cache: true,
	      loaders: [
	        {
	          path: 'babel-loader',
	          query: {
	            cacheDirectory: false
	          }
	        }
	      ],
	      threads: 8
	    }),*/
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin(),
			new WebpackShellPlugin({ 
				onBuildStart: [function(){
					if(!isEchoStart){
						isEchoStart = true;
					}
				}],
				onBuildEnd: [function(){
					if(!isEchoEnd){
						setTimeout(function(){
							TimerUtil.end("Load lobenton");
						}, 0);
						
						isEchoEnd = true;
					}
				}] 
	    })
		],
		module: {
			loaders: [
				/*{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					include: rootPath+"/src",
					query: {
						plugins: [],
						compact: false
					}
				},*/
				{
					test: /\.js$/,
					loader: 'happypack/loader',
					exclude: /node_modules/,
					include: rootPath
				},
				{
					test: /\.css$/,
					loader: "style-loader!css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader",
					include: rootPath
				},
				{
	        test: /\.png$/,
	        loader: 'file'
	      },
				{
          test: /\.jpg$/,
          loader: 'file'
	      },
				{
          test: /\.gif$/,
          loader: 'file'
	      },
	      {
	        test: /\.svg$/,
	        loader: 'file'
	      }
			]
		}
	}, config);
};
