'use strict';

const config = require('config');
const express = require('express');
const logger = require('morgan');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const DashboardPlugin = require('webpack-dashboard/plugin');

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const path = require('path');

const app = new express();

// ## Middleware

app.use(logger('dev'));
app.use(express.static(path.resolve(__dirname, '../public')));

// ## Routes
if (config.env === 'dev') {

	const compiler = webpack(webpackConfig);
	compiler.apply(new DashboardPlugin());
	app.use(webpackDevMiddleware(compiler));
	app.use(webpackHotMiddleware(compiler));
}

app.listen(config.port, () => console.log(`Server running on port ${config.port}...`));
