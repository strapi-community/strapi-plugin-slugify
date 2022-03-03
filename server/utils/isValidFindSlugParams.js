const { ValidationError } = require('@strapi/utils/lib/errors');

const isValidFindSlugParams = (params) => {
	if (!params) {
		throw new ValidationError('A model and slug must be provided.');
	}

	const { modelName, slug, models } = params;

	if (!modelName) {
		throw new ValidationError('A model name path variable is required.');
	}

	if (!slug) {
		throw new ValidationError('A slug path variable is required.');
	}

	const model = models[modelName];

	// ensure valid model is passed
	if (!model) {
		throw new ValidationError(
			`${modelName} model name not found, all models must be defined in the settings and are case sensitive.`
		);
	}
};

module.exports = {
	isValidFindSlugParams,
};
