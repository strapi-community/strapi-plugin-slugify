'use strict';

const { buildSettings } = require('./buildSettings');
const { setupLifecycles } = require('./setupLifecycles');
const { syncSlugCount } = require('./syncSlugCount');

module.exports = async () => {
	const settings = await buildSettings();

	if (settings.slugifyWithCount) {
		// Ensure correct count used for old plugin versions and projects with existing slugs.
		await syncSlugCount(settings);
	}

	setupLifecycles(settings);
};
