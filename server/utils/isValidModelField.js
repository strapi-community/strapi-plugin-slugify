'use strict';

const _ = require('lodash');

const isValidModelField = (model, field) =>
	_.get(model, ['attributes', field], false) || field === 'id';

module.exports = {
	isValidModelField,
};
