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
		settings.modelsByUID = {};
		settings.modelsByName = {};
		_.each(strapi.contentTypes, (contentType, uid) => {
			const model = settings.contentTypes[contentType.modelName];
			if (!model) {
				return;
			}

			// ensure provided fields are present on the model
			const hasField = isValidModelField(contentType, model.field);
			if (!hasField) {
				strapi.log.warn(
					`[slugify] skipping ${contentType.info.singularName} registration, invalid field provided.`
				);
				return;
			}

			let references = _.isArray(model.references) ? model.references : [model.references];
			const hasReferences = references.every((referenceField) =>
				isValidModelField(contentType, referenceField)
			);
			if (!hasReferences) {
				strapi.log.warn(
					`[slugify] skipping ${contentType.info.singularName} registration, invalid reference field provided.`
				);
				return;
			}

			const data = {
				uid,
				...model,
				contentType,
				references,
			};
			settings.modelsByUID[uid] = data;
			settings.modelsByName[contentType.modelName] = data;
		});

		_.omit(settings, ['contentTypes']);

		return settings;
	},
});
