'use strict';

const { pluginId } = require('./pluginId');

/**
 * A helper function to obtain a plugin service
 *
 * @return service
 */
const getPluginService = (name, plugin = pluginId) => strapi.plugin(plugin).service(name);

module.exports = {
	getPluginService,
};
