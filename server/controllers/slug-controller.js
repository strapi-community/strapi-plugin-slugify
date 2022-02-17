'use strict';

const { getPluginService } = require('../utils/getPluginService');

module.exports = ({ strapi }) => ({
	async findSlug(ctx) {
		const { models } = getPluginService(strapi, 'settingsService').get();
		const { params } = ctx.request;
		const { modelName, slug } = params;

		try {
			if (!modelName) {
				throw Error('A model name pah variable is required.');
			}

			if (!slug) {
				throw Error('A slug path variable is required.');
			}

			const model = models[modelName];
			if (!model) {
				throw Error(
					`${modelName} model name not found, all models must be defined in the settings.`
				);
			}

			const { uid, field } = model;
			let query = ctx.query;

			if (!query.filters) {
				query.filters = {};
			}
			query.filters[field] = slug;

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
