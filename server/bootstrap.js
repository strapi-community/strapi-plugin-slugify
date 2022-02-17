'use strict';

const _ = require('lodash');
const { SUPPORTED_LIFECYCLES } = require('./utils/constants');
const { getPluginService } = require('./utils/getPluginService');

module.exports = ({ strapi }) => {
	const settings = getPluginService(strapi, 'settingsService').get();

	const { contentTypes, slugifyOptions } = settings;

	// build settings structure
	const uids = {};
	const models = {};
	_.forEach(strapi.contentTypes, (value, key) => {
		if (contentTypes[value.modelName]) {
			const data = {
				uid: value.uid,
				...contentTypes[value.modelName],
			};
			uids[key] = data;
			models[value.modelName] = data;
		}
	});

	// reset plugin settings
	getPluginService(strapi, 'settingsService').set({
		models,
		uids,
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
