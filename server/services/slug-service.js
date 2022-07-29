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

		// ensure the reference field has data
		let referenceFieldValues = references
			.filter((r) => typeof data[r] !== 'undefined' && data[r].length)
			.map((r) => data[r]);


		// If there is an existing reference then don't generate a new slug.
		if (ctx.params.where && ctx.params.where.id) {
			const current = await strapi.entityService.findOne(entityModel.uid, ctx.params.where.id);
			if (current) {
				let currentReferenceFieldValues = references
					.filter((r) => typeof current[r] !== 'undefined' && current[r].length)
					.map((r) => current[r]);

				if (JSON.stringify(referenceFieldValues) == JSON.stringify(currentReferenceFieldValues)) {
					return
				}
			}
		}

		const hasUndefinedFields = referenceFieldValues.length < references.length;
		if ((!settings.skipUndefinedReferences && hasUndefinedFields) || !referenceFieldValues.length) {
			return;
		}

		referenceFieldValues = referenceFieldValues.join(' ');
		if (settings.slugifyWithCount) {
			data[field] = toSlugWithCount(referenceFieldValues, settings.slugifyOptions);
			return;
		}

		data[field] = toSlug(referenceFieldValues, settings.slugifyOptions);
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
