'use strict';

const _ = require('lodash');
const { pluginId } = require('../utils/pluginId');

module.exports = ({ strapi }) => ({
	get() {
		return strapi.config.get(`plugin.${pluginId}`);
	},
	set(settings) {
		return strapi.config.set(`plugin.${pluginId}`, settings);
	},
	build(contentTypes) {
		let models = {};

		_.filter(strapi.contentTypes, (value, uid) => {
			const model = contentTypes[value.modelName];
			if (!model) {
				return;
			}

			// ensure provided fields are present on the model
			const hasField = _.get(value, ['attributes', model.field], false);
			const hasReference = _.get(value, ['attributes', model.references], false);
			if (!hasField || !hasReference) {
				strapi.log.warn(
					`[slugify] skipping ${value.info.singularName} registration, invalid field and/or reference provided.`
				);
				return;
			}

			const data = {
				uid,
				...contentTypes[value.modelName],
				contentType: value,
			};
			models[uid] = data;
			models[value.modelName] = data;
		});

		return models;
	},
});
