'use strict';

const _ = require('lodash');
const { isValidModelField } = require('../utils/isValidModelField');
const { pluginId } = require('../utils/pluginId');

module.exports = ({ strapi }) => ({
	get() {
		return strapi.config.get(`plugin.${pluginId}`);
	},
	set(settings) {
		return strapi.config.set(`plugin.${pluginId}`, settings);
	},
	build(settings) {
		// build models
		settings.models = {};
		_.filter(strapi.contentTypes, (contentType, uid) => {
			const model = settings.contentTypes[contentType.modelName];
			if (!model) {
				return;
			}

			// ensure provided fields are present on the model
			const hasField = isValidModelField(model, model.field);
			const hasReference = isValidModelField(model, model.references);
			if (!hasField || !hasReference) {
				strapi.log.warn(
					`[slugify] skipping ${contentType.info.singularName} registration, invalid field and/or reference provided.`
				);
				return;
			}

			const data = {
				uid,
				...model,
				contentType,
			};
			settings.models[uid] = data;
			settings.models[contentType.modelName] = data;
		});

		_.omit(settings, ['contentTypes']);

		return settings;
	},
});
