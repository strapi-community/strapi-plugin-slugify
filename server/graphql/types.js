const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');

const getCustomTypes = (strapi, nexus) => {
	const { naming } = getPluginService(strapi, 'utils', 'graphql');
	const { toEntityResponse } = getPluginService(strapi, 'format', 'graphql').returnTypes;
	const { models } = getPluginService(strapi, 'settingsService').get();
	const { getEntityResponseName } = naming;

	// get all types required for findSlug query
	let findSlugTypes = {
		response: [],
	};
	_.forEach(strapi.contentTypes, (value, key) => {
		if (models[key]) {
			findSlugTypes.response.push(getEntityResponseName(value));
		}
	});

	// ensure we have at least one type before attempting to register
	if (!findSlugTypes.response.length) {
		return [];
	}

	// build custom union type based on defined models
	const FindSlugResponse = nexus.unionType({
		name: 'FindSlugResponse',
		description: 'Union Type of all registered slug content types',
		definition(t) {
			t.members(...findSlugTypes.response);
		},
		resolveType: (ctx) => {
			return getEntityResponseName(models[ctx.info.resourceUID].contentType);
		},
	});

	return [
		FindSlugResponse,
		nexus.extendType({
			type: 'Query',
			definition: (t) => {
				t.field('findSlug', {
					type: FindSlugResponse,
					args: {
						modelName: nexus.stringArg('The model name of the content type'),
						slug: nexus.stringArg('The slug to query for'),
					},
					resolve: async (_, args) => {
						const { models } = getPluginService(strapi, 'settingsService').get();
						const { modelName, slug } = args;

						const model = models[modelName];

						// ensure valid model is passed
						if (!model) {
							return toEntityResponse(null, { resourceUID: uid });
						}

						const { uid, field, contentType } = model;
						let query = {
							filters: {
								[field]: slug,
							},
						};

						// only return published entries
						if (_.get(contentType, ['options', 'draftAndPublish'], false)) {
							query.publicationState = 'live';
						}

						const data = await getPluginService(strapi, 'slugService').findOne(uid, query);
						return toEntityResponse(data, { resourceUID: uid });
					},
				});
			},
		}),
	];
};

module.exports = {
	getCustomTypes,
};
