const _ = require('lodash');
const { getPluginService } = require('../utils/getPluginService');
const { isValidFindSlugParams } = require('../utils/isValidFindSlugParams');
const { hasRequiredModelScopes } = require('../utils/hasRequiredModelScopes');
const { sanitizeOutput } = require('../utils/sanitizeOutput');
const { ForbiddenError, ValidationError } = require('@strapi/utils').errors;

const getCustomTypes = (strapi, nexus) => {
	const { naming } = getPluginService('utils', 'graphql');
	const { toEntityResponse } = getPluginService('format', 'graphql').returnTypes;
	const { modelsByUID } = getPluginService('settingsService').get();
	const { getEntityResponseName } = naming;

	// get all types required for findSlug query
	let findSlugTypes = {
		response: [],
	};
	_.forEach(strapi.contentTypes, (contentType, uid) => {
		if (modelsByUID[uid]) {
			findSlugTypes.response.push(getEntityResponseName(contentType));
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
			return getEntityResponseName(modelsByUID[ctx.info.resourceUID].contentType);
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
						publicationState: nexus.stringArg('The publication state of the entry'),
					},
					resolve: async (_parent, args, ctx) => {
						const { modelsByName } = getPluginService('settingsService').get();
						const { modelName, slug, publicationState } = args;
						const { auth } = ctx.state;

						try {
							isValidFindSlugParams({
								modelName,
								slug,
								modelsByName,
								publicationState,
							});
						} catch (error) {
							throw new ValidationError(error.message);
						}
						const { uid, field, contentType } = modelsByName[modelName];

						try {
							await hasRequiredModelScopes(strapi, uid, auth);
						} catch (error) {
							throw new ForbiddenError();
						}

						// build query
						let query = {
							filters: {
								[field]: slug,
							},
						};

						// only return published entries by default if content type has draftAndPublish enabled
						if (_.get(contentType, ['options', 'draftAndPublish'], false)) {
							query.publicationState = publicationState || 'live';
						}

						const data = await getPluginService('slugService').findOne(uid, query);
						const sanitizedEntity = await sanitizeOutput(data, contentType, auth);
						return toEntityResponse(sanitizedEntity, { resourceUID: uid });
					},
				});
			},
		}),
	];
};

module.exports = {
	getCustomTypes,
};
