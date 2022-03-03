'use strict';

const _ = require('lodash');
const { sanitize, errors } = require('@strapi/utils');
const { getPluginService } = require('../utils/getPluginService');
const { transformResponse } = require('@strapi/strapi/lib/core-api/controller/transform');

const { ValidationError, ForbiddenError } = errors;

module.exports = ({ strapi }) => ({
	async findSlug(ctx) {
		const { models } = getPluginService(strapi, 'settingsService').get();
		const { modelName, slug } = ctx.request.params;
		const { auth } = ctx.state;

		try {
			if (!modelName) {
				throw new ValidationError('A model name path variable is required.');
			}

			if (!slug) {
				throw new ValidationError('A slug path variable is required.');
			}

			const model = models[modelName];
			if (!model) {
				throw new ValidationError(
					`${modelName} model name not found, all models must be defined in the settings and are case sensitive.`
				);
			}

			const { uid, field, contentType } = model;

			// Check if the user making the request has the
			// `find` permission on the targeted model.
			try {
				await strapi.auth.verify(auth, { scope: `${uid}.findOne` });
			} catch (e) {
				throw new ForbiddenError();
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

			const data = await getPluginService(strapi, 'slugService').findOne(uid, query);

			if (data) {
				const sanitizedEntity = await sanitize.contentAPI.output(data, contentType, { auth });
				ctx.body = transformResponse(sanitizedEntity);
			} else {
				ctx.notFound();
			}
		} catch (error) {
			ctx.badRequest(error.message);
		}
	},
});
