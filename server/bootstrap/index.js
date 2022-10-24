'use strict';

const { buildSettings } = require('./buildSettings');
const { setupLifecycles } = require('./setupLifecycles');

module.exports = async ({ strapi }) => {
	const settings = await buildSettings(strapi);
	setupLifecycles(settings);
};
