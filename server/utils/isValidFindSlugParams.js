const { ValidationError } = require('@strapi/utils/lib/errors');

const isValidFindSlugParams = (params) => {
	if (!params) {
		throw new ValidationError('A model and slug must be provided.');
	}

	const { modelName, slug, models, publicationState } = params;
	const model = models[modelName];

	if (!modelName) {
		throw new ValidationError('A model name path variable is required.');
	}

	if (!slug) {
		throw new ValidationError('A slug path variable is required.');
	}

	if (!model.contentType.options.draftAndPublish && publicationState) {
		throw new ValidationError('Draft and Publish is not enabled for this content-type. Please enable Draft and Publish if you want to filter by publication state.')
	}

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
