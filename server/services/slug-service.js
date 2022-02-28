'use strict';

const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const { toSlug, toSlugWithCount } = require('../utils/slugification');

module.exports = ({ strapi }) => ({
	slugify(ctx) {
		const settings = getPluginService(strapi, 'settingsService').get();
		const { params, model: entityModel } = ctx;
		const { data } = params;

		const model = settings.models[entityModel.uid];

		if (!data) {
			return;
		}

		const { field, references } = model;
		const referenceFieldValue = data[references];

		// ensure the reference field has data
		if (typeof referenceFieldValue === 'undefined') {
			return;
		}

		if (settings.slugifyWithCount) {
			data[field] = toSlugWithCount(referenceFieldValue, settings.slugifyOptions);
			return;
		}

		data[field] = toSlug(referenceFieldValue, settings.slugifyOptions);
	},

	async findOne(uid, query) {
		const slugs = await strapi.entityService.findMany(uid, query);

		// single
		if (slugs && _.isPlainObject(slugs)) {
			return slugs;
		}

		// collection
		if (slugs && _.isArray(slugs) && slugs.length) {
			return slugs[0];
		}

		// no result
		return null;
	},
});
