const slugify = require('@sindresorhus/slugify');

const buildSlug = async (string, settings) => {
	let slug = slugify(string, settings.slugifyOptions);

	// slugify with count
	if (!settings.slugifyWithCount) {
		return slug;
	}

	const slugEntry = await strapi.db.query('plugin::slugify.slug').findOne({
		select: ['id', 'count'],
		where: { slug },
	});

	// if no result then count is 1 and base slug is returned
	if (!slugEntry) {
		await strapi.entityService.create('plugin::slugify.slug', {
			data: {
				slug,
				count: 1,
			},
		});

		return slug;
	}

	const count = slugEntry.count + 1;
	await strapi.entityService.update('plugin::slugify.slug', slugEntry.id, {
		data: {
			count,
		},
	});

	return `${slug}-${count}`;
};

module.exports = {
	buildSlug,
};
