'use strict';

const slugify = require('@sindresorhus/slugify');
const slugifyWithCount = slugify.counter();

const toSlug = (string, options) => slugify(string, options);
const toSlugWithCount = (string, options) => slugifyWithCount(string, options);

module.exports = {
	toSlug,
	toSlugWithCount,
};
