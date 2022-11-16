'use strict';

const syncSlugCount = async (settings) => {
	const entries = await strapi.entityService.findMany('plugin::slugify.slug', {
		filters: { createdAt: { $gt: 1 } },
	});

	// if entries aready present we can skip sync
	if (entries && entries.length) {
		return;
	}

	strapi.log.info('[slugify] syncing slug count for registered content types');

	const slugs = new Map();

	// chec slugs in each reigistered model
	for (const uid in settings.modelsByUID) {
		if (!Object.hasOwnProperty.call(settings.modelsByUID, uid)) {
			continue;
		}

		const model = settings.modelsByUID[uid];

		// using db query to avoid the need to check if CT has draftAndPublish enabled
		const modelEntries = await strapi.db.query(model.uid).findMany({
			filters: { createdAt: { $gt: 1 } },
		});

		strapi.log.info(`[slugify] syncing slug count for ${model.uid}`);
		for (const entry of modelEntries) {
			const slug = entry[model.field];
			if (!slug) {
				continue;
			}

			const record = slugs.get(getNonAppendedSlug(slug));
			if (!record) {
				slugs.set(slug, { slug, count: 1 });
				continue;
			}

			slugs.set(record.slug, { slug: record.slug, count: record.count + 1 });
		}
		strapi.log.info(`[slugify] sync for ${model.uid} completed`);
	}

	if (slugs.size) {
		// create all required records
		const createResponse = await strapi.db.query('plugin::slugify.slug').createMany({
			data: [...slugs.values()],
		});

		strapi.log.info(
			`[slugify] ${createResponse.count} out of ${slugs.size} slugs synced successfully`
		);
	} else {
		strapi.log.info('[slugify] No syncable slugs found');
	}
};

// removes any appended number from a slug/string if found
const getNonAppendedSlug = (slug) => {
	const match = slug.match('[\\-]{1}[\\d]+$');

	if (!match) {
		return slug;
	}

	return slug.replace(match[0], '');
};

module.exports = {
	syncSlugCount,
};
