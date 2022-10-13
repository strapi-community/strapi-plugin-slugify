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
		_.each(strapi.contentTypes, (contentType, uid) => {
			const model = settings.contentTypes[contentType.modelName];
			if (!model) {
				return;
			}

			// ensure provided fields are present on the model
			let hasField = false;
			let hasComponentField = false;

			if(model.component && strapi.components[model.component]) {
				hasComponentField = isValidModelField(strapi.components[model.component], model.field);
			}
			if(!model.component) {
				hasField = isValidModelField(contentType, model.field);
			}

			if (!hasField && !hasComponentField) {
				strapi.log.warn(
					`[slugify] skipping ${contentType.info.singularName} registration, invalid field provided.`
				);
				return;
			}

			let references = _.isArray(model.references) ? model.references : [model.references];
			const hasReferences = references.every((r) => isValidModelField(contentType, r) || (model.component && strapi.components[model.component] && isValidModelField(strapi.components[model.component], r)));
			if (!hasReferences) {
				strapi.log.warn(
					`[slugify] skipping ${contentType.info.singularName} registration, invalid reference field provided.`
				);
				return;
			}

			uid = model.component && strapi.components[model.component] ? model.component : uid;

			const data = {
				uid,
				...model,
				contentType,
				references,
			};

			settings.models[uid] = data;
			settings.models[contentType.modelName] = data;
		});

		_.omit(settings, ['contentTypes']);

		return settings;
	},
});
