'use strict';

const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const { toSlug, toSlugWithCount } = require('../utils/slugification');

module.exports = ({ strapi }) => ({
	async slugify(ctx) {

		const { params, model: entityModel } = ctx;

		// Check to see if we have an existing reference and if it matches.
		if (ctx.params.where && ctx.params.where.id) {
			let current = await strapi.entityService.findOne(entityModel.uid, ctx.params.where.id)
			this.update(ctx, current)
		} else {
			this.update(ctx)
		}
	},

	update(ctx, current = null) {

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


		let shouldUpdate = true
		if (current) {
			let currentReferenceFieldValues = references
				.filter((r) => typeof current[r] !== 'undefined' && current[r].length)
				.map((r) => current[r]);

			if (JSON.stringify(referenceFieldValues) == JSON.stringify(currentReferenceFieldValues)) {
				shouldUpdate = false
			}
		}

		// Make sure we are only updating if there isn't a slug, this is a new instance or the currently
		// referenced fields don't match with the updated values.
		if (shouldUpdate || !current || !data[field]) {
			const hasUndefinedFields = referenceFieldValues.length < references.length;
			if ((!settings.skipUndefinedReferences && hasUndefinedFields) || !referenceFieldValues.length) {
				return;
			}

			referenceFieldValues = referenceFieldValues.join(' ');
			if (settings.slugifyWithCount) {
				data[field] = toSlugWithCount(referenceFieldValues, settings.slugifyOptions);
			} else {
				data[field] = toSlug(referenceFieldValues, settings.slugifyOptions);
			}
			console.log(data[field])
		}

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
