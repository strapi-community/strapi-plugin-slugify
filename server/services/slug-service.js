'use strict';

const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const { toSlug, toSlugWithCount } = require('../utils/slugification');

module.exports = ({ strapi }) => ({
	async slugify(ctx) {

		const { params, model: entityModel } = ctx;

		// Check to see if we have an existing reference and if it matches.
		let current = null;
		if (params.where && params.where.id) {
			let current = await strapi.entityService.findOne(entityModel.uid, params.where.id)
		}
		this.update(ctx, current)
	},

	update(ctx, current) {

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
		if (current && current[field]) {
		    shouldUpdate = true;
		}

		// Reference the updateSlugs settings to determine if user wants slugs to be updated.
		// If there isn't a current reference then proceed.
		if ((shouldUpdate && settings.shoudUpdateSlug) || !current || !data[field]) {
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
