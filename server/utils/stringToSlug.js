'use strict';

const slugify = require('@sindresorhus/slugify');

const stringToSlug = (string, options) => {
	return slugify(string, options);
};

module.exports = {
	stringToSlug,
};
