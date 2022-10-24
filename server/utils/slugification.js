'use strict';

const _ = require('lodash');
const slugify = require('@sindresorhus/slugify');
const slugifyWithCount = slugify.counter();

const toSlug = (string, options) => {
	if (options.slugifyWithCount) {
		_.omit(options, 'slugifyWithCount');
		return slugifyWithCount(string, options);
	}

	return slugify(string, options);
};

module.exports = {
	toSlug,
};
