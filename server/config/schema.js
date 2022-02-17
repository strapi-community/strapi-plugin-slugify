'use strict';

const yup = require('yup');
const _ = require('lodash');

const pluginConfigSchema = yup.object().shape({
	slugifyOptions: yup.object(),
	contentTypes: yup.lazy((obj) => {
		// eslint-disable-next-line no-unused-vars
		let shape = {};
		_.each(obj, (_, key) => {
			shape[key] = yup.object().shape({
				field: yup.string().required(),
				references: yup.string().required(),
			});
		});
		return yup.object().shape(shape);
	}),
});

module.exports = {
	pluginConfigSchema,
};
