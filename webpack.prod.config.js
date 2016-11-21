"use strict";

var path = require('path');
var webpack = require('webpack');
var HappyPack = require('happypack');
var deepAssign = require("deep-assign");
var ExtracTextPlugin = require('extract-text-webpack-plugin');
var rootPath = path.resolve(__dirname, path.relative(__dirname,''));
var bundle = {
	bundle: [
		'babel-polyfill',
		'./lib/client/index.js',
	],
	en:['./lib/client/locales/en/en.js'],
	zhTW: ['./lib/client/locales/zhTW/zhTW.js']
};

module.exports = function webpackBundleConfigMain(config) {
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
			publicPath: '',
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
			new HappyPack({
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
	    }),
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			}),
			new ExtracTextPlugin(config.name+'.css', {
				allChunks: true
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
					loader: ExtracTextPlugin.extract('style',"css?modules&localIdentName=[name]__[local]___[hash:base64:5]"),
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
	      },
	      {
	        test: /\.json$/,
	        loader: 'json'
	      }
	    ]
		}
	}, config);
};
