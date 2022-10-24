'use strict';

const schema = require('./schema');

module.exports = {
	default: () => ({
		contentTypes: {},
		slugifyOptions: {},
		slugifyWithCount: false,
		shouldUpdateSlug: false,
		skipUndefinedReferences: false,
	}),
	validator: (config) => schema.validateSync(config),
};
