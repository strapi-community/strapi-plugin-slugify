'use strict';

const { getPluginService } = require('../utils/getPluginService');
const { stringToSlug } = require('../utils/stringToSlug');

module.exports = ({ strapi }) => ({
	slugify(ctx) {
		const { uids, slugifyOptions } = getPluginService(strapi, 'settingsService').get();

		const { params, model: entityModel } = ctx;
		const model = uids[entityModel.uid];
		const { data } = params;

		if (!data) {
			return;
		}

		const field = model.field;
		const references = data[model.references];

		// for empty values they are null, undefined means they are not on the model.
		if (!field || typeof references === 'undefined') {
			return;
		}

		data[field] = stringToSlug(references, slugifyOptions);
	},

	async findOne(uid, query) {
		const slugs = await strapi.entityService.findMany(uid, query);

		return slugs.length ? slugs[0] : null;
	},
});
