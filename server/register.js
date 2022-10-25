'use strict';

const { registerGraphlQLQuery } = require('./graphql');
const { getPluginService } = require('./utils/getPluginService');

module.exports = ({ strapi }) => {
	const { contentTypes } = getPluginService('settingsService').get();

	// ensure we have at least one model before attempting registration
	if (!Object.keys(contentTypes).length) {
		return;
	}
	// add graphql query if present
	if (strapi.plugin('graphql')) {
		strapi.log.info('[slugify] graphql detected, registering queries');
		registerGraphlQLQuery(strapi);
	}
};
