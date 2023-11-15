'use strict';

const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const { isValidFindSlugParams } = require('../utils/isValidFindSlugParams');
const { sanitizeOutput } = require('../utils/sanitizeOutput');
const { hasRequiredModelScopes } = require('../utils/hasRequiredModelScopes');
const transform = require('../utils/transform');

module.exports = ({ strapi }) => ({
	async findSlug(ctx) {
		const { modelsByName } = getPluginService('settingsService').get();
		const { modelName, slug } = ctx.request.params;
		const { auth } = ctx.state;

		try {
			isValidFindSlugParams({
				modelName,
				slug,
				modelsByName,
			});
		} catch (error) {
			return ctx.badRequest(error.message);
		}

		const { uid, field, contentType } = modelsByName[modelName];

		try {
			await hasRequiredModelScopes(strapi, uid, auth);
		} catch (error) {
			return ctx.forbidden();
		}

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

		const data = await getPluginService('slugService').findOne(uid, query);

		if (data) {
			const sanitizedEntity = await sanitizeOutput(data, contentType, auth);
			ctx.body = transform.response({ data: sanitizedEntity, schema: contentType });
		} else {
			ctx.notFound();
		}
	},
});
