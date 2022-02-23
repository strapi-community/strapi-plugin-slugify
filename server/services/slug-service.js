'use strict';

const { getPluginService } = require('../utils/getPluginService');
const { stringToSlug } = require('../utils/stringToSlug');

module.exports = ({ strapi }) => ({
	slugify(ctx) {
		const { models, slugifyOptions } = getPluginService(strapi, 'settingsService').get();

		const { params, model: entityModel } = ctx;
		const model = models[entityModel.uid];
		const { data } = params;

		if (!data) {
			return;
		}

		const { field, references } = model;
		const referenceFieldValue = data[references];

		// ensure the reference field has data
		if (typeof referenceFieldValue === 'undefined') {
			return;
		}

		data[field] = stringToSlug(referenceFieldValue, slugifyOptions);
	},

	async findOne(uid, query) {
		const slugs = await strapi.entityService.findMany(uid, query);

		return slugs.length ? slugs[0] : null;
	},
});
