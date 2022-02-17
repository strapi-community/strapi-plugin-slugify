'use strict';

const slugRoutes = require('./slug-routes');

module.exports = {
	'content-api': {
		type: 'content-api',
		routes: slugRoutes,
	},
};
