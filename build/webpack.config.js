 const webpack = require('webpack')
 const path = require('path');
 module.exports = {
 	entry: {
 		main: path.resolve(__dirname, '../src/main')
 	},
 	resolve: {
 		extensions: ['.js', '.html']
 	},
 	output: {
 		path: path.resolve(__dirname, '../public'),
 		filename: '[name].js',
 		chunkFilename: '[name].[id].js'
 	},
 	plugins: [
 		new webpack.optimize.OccurrenceOrderPlugin()
 	],
 	module: {
 		rules: [{
 				test: /\.(html|js)$/,
 				exclude: /node_modules/,
 				use: {
 					loader: 'babel-loader'
 				}
 			},
 			{
 				test: /\.html$/,
 				exclude: /node_modules/,
 				use: 'svelte-loader'
 			}
 		]
 	},
 	devtool: 'inline-source-map'
 }
