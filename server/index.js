'use strict';

const bootstrap = require('./bootstrap');
const register = require('./register');
const config = require('./config');
const controllers = require('./controllers');
const routes = require('./routes');
const services = require('./services');

module.exports = {
	bootstrap,
	register,
	config,
	controllers,
	routes,
	services,
};
