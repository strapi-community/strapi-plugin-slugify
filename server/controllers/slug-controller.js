'use strict';

const { getPluginService } = require('../utils/getPluginService');
const _ = require('lodash');

module.exports = ({ strapi }) => ({
	async findSlug(ctx) {
		const { models } = getPluginService(strapi, 'settingsService').get();
		const { params } = ctx.request;
		const { modelName, slug } = params;

		try {
			if (!modelName) {
				throw Error('A model name path variable is required.');
			}

			if (!slug) {
				throw Error('A slug path variable is required.');
			}

			const model = models[modelName];
			if (!model) {
				throw Error(
					`${modelName} model name not found, all models must be defined in the settings and are case sensitive.`
				);
			}

			const { uid, field, contentType } = model;

			// add slug filter to any already existing query restrictions
			let query = ctx.query || {};
			if (!query.filters) {
				query.filters = {};
			}
			query.filters[field] = slug;

			// only return published entries by default if content type has draftAndPublish enabled
			if (_.get(contentType, ['options', 'draftAndPublish'], false) && !query.publicationState) {
				query.publicationState = 'live';
			}

			const data = await getPluginService(strapi, 'slugService').findOne(uid, query);

			if (data) {
				return ctx.send({ data });
			}
			ctx.notFound();
		} catch (error) {
			ctx.badRequest(error.message);
		}
	},
});
