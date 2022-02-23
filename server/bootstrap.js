'use strict';

const _ = require('lodash');
const { SUPPORTED_LIFECYCLES } = require('./utils/constants');
const { getPluginService } = require('./utils/getPluginService');

module.exports = ({ strapi }) => {
	const settingsService = getPluginService(strapi, 'settingsService');
	const settings = settingsService.get();

	const { contentTypes, slugifyOptions } = settings;

	// build settings structure
	const models = settingsService.build(contentTypes);

	// reset plugin settings
	settingsService.set({
		models,
		slugifyOptions,
	});

	// set up lifecycles
	const subscribe = {
		models: _.map(models, (m) => m.uid),
	};

	SUPPORTED_LIFECYCLES.forEach((lifecycle) => {
		subscribe[lifecycle] = (ctx) => {
			getPluginService(strapi, 'slugService').slugify(ctx);
		};
	});

	strapi.db.lifecycles.subscribe(subscribe);
};
