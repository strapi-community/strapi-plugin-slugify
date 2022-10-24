const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const setupLifecycles = (settings) => {
	// set up lifecycles
	const subscribe = {
		models: _.map(settings.modelsByUID, (model) => model.uid),
	};

	['beforeCreate', 'afterCreate', 'beforeUpdate'].forEach((lifecycle) => {
		subscribe[lifecycle] = (ctx) => getPluginService('slugService').slugify(ctx);
	});

	strapi.db.lifecycles.subscribe(subscribe);
};

module.exports = {
	setupLifecycles,
};
