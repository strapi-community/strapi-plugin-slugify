'use strict';

const yup = require('yup');
const _ = require('lodash');

const schema = yup.object().shape({
	slugifyOptions: yup.object(),
	contentTypes: yup.lazy((obj) => {
		let shape = {};
		_.each(obj, (_value, key) => {
			shape[key] = yup.object().shape({
				field: yup.string().required(),
				references: yup.lazy((v) =>
					_.isArray(v) ? yup.array().of(yup.string()).required() : yup.string().required()
				),
			});
		});
		return yup.object().shape(shape);
	}),
	slugifyWithCount: yup.bool(),
	shouldUpdateSlug: yup.bool(),
	skipUndefinedReferences: yup.bool(),
});

module.exports = schema;
