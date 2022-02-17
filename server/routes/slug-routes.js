'use strict';

module.exports = [
	{
		method: 'GET',
		path: '/slugs/:modelName/:slug',
		handler: 'slugController.findSlug',
	},
];
