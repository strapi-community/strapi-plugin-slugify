'use strict';

const { pluginConfigSchema } = require('./schema');

module.exports = {
	default() {
		return {
			contentTypes: {},
			slugifyOptions: {},
			slugifyWithCount: false,
			updateSlugs: false,
			skipUndefinedReferences: false,
		};
	},
	async validator(config) {
		await pluginConfigSchema.validate(config);
	},
};
