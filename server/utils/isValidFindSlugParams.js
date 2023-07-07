const { ValidationError } = require('@strapi/utils').errors;
const _ = require('lodash');

const isValidFindSlugParams = (params) => {
	if (!params) {
		throw new ValidationError('A model and slug must be provided.');
	}

	const { modelName, slug, modelsByName, publicationState } = params;
	const model = modelsByName[modelName];

	if (!modelName) {
		throw new ValidationError('A model name path variable is required.');
	}

	if (!slug) {
		throw new ValidationError('A slug path variable is required.');
	}

	if (!_.get(model, ['contentType', 'options', 'draftAndPublish'], false) && publicationState) {
		throw new ValidationError(
			'Filtering by publication state is only supported for content types that have Draft and Publish enabled.'
		);
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
