'use strict';

const { pluginId } = require('../utils/pluginId');

module.exports = ({ strapi }) => ({
	get() {
		return strapi.config.get(`plugin.${pluginId}`);
	},
	set(settings) {
		return strapi.config.set(`plugin.${pluginId}`, settings);
	},
});
