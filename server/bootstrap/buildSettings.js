const { getPluginService } = require('../utils/getPluginService');
const buildSettings = async () => {
	const settingsService = getPluginService('settingsService');
	const settings = await settingsService.get();

	// build settings structure
	const normalizedSettings = settingsService.build(settings);

	// reset plugin settings
	await settingsService.set(normalizedSettings);

	return normalizedSettings;
};

module.exports = {
	buildSettings,
};
