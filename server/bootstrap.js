'use strict';

const _ = require('lodash');
const { SUPPORTED_LIFECYCLES } = require('./utils/constants');
const { getPluginService } = require('./utils/getPluginService');

module.exports = ({ strapi }) => {
	const settingsService = getPluginService(strapi, 'settingsService');
	const settings = settingsService.get();

	// build settings structure
	const normalizedSettings = settingsService.build(settings);

	// reset plugin settings
	settingsService.set(normalizedSettings);

	const modelComponents = _.filter(normalizedSettings.models, (m) => m.component !== undefined && m.component !== null);
	subscribe(_.map(modelComponents, (m) => m.component));

	const models = _.filter(normalizedSettings.models, (m) => m.component === undefined || m.component === null);
	subscribe(_.map(models, (m) => m.uid));
};

function subscribe(models) {

	const subscribe = {
		models: models,
	};

	SUPPORTED_LIFECYCLES.forEach((lifecycle) => {
		subscribe[lifecycle] = async (ctx) => {
			await getPluginService(strapi, 'slugService').slugify(ctx);
		};
	});

	strapi.db.lifecycles.subscribe(subscribe);
}
