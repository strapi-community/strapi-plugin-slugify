'use strict';

const { pluginConfigSchema } = require('./schema');

module.exports = {
	async validator(config) {
		await pluginConfigSchema.validate(config);
	},
	default: () => ({
		contentTypes: {},
		slugifyOptions: {},
		slugifyWithCount: false,
		shouldUpdateSlug: false,
		skipUndefinedReferences: false,
	}),
};
