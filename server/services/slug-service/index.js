'use strict';

const _ = require('lodash');
const { getPluginService } = require('../../utils/getPluginService');
const { shouldUpdateSlug } = require('./shoudUpdateSlug');
const { getReferenceFieldValues } = require('./getReferenceFieldValues');
const { buildSlug } = require('./buildSlug');

module.exports = ({ strapi }) => ({
	async slugify(ctx) {
		const { params, model: entityModel } = ctx;
		const settings = getPluginService('settingsService').get();
		const { data } = params;

		const model = settings.modelsByUID[entityModel.uid];
		if (!data) {
			return;
		}

		const { field, references } = model;

		// do not add/update slug if it already has a value unless settings specify otherwise
		if (!settings.shouldUpdateSlug && data[field]) {
			return;
		}

		// ensure the reference field has data
		let referenceFieldValues = getReferenceFieldValues(ctx, data, references);

		// respect skip undefined fields setting
		const hasUndefinedFields = referenceFieldValues.length < references.length;
		if ((!settings.skipUndefinedReferences && hasUndefinedFields) || !referenceFieldValues.length) {
			return;
		}

		// check if the slug should be updated based on the action type
		let shouldUpdateSlugByAction = await shouldUpdateSlug(strapi, ctx, references);
		if (!shouldUpdateSlugByAction) {
			return;
		}

		referenceFieldValues = referenceFieldValues.join(' ');

		// update slug field based on action type
		const slug = await buildSlug(referenceFieldValues, settings);

		if (ctx.action === 'beforeCreate' || ctx.action === 'beforeUpdate') {
			data[field] = slug;
		} else if (ctx.action === 'afterCreate') {
			strapi.entityService.update(model.uid, ctx.result.id, {
				data: {
					slug,
				},
			});
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
