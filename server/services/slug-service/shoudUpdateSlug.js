'use strict';

const { getReferenceFieldValues } = require('./getReferenceFieldValues');

const shouldUpdateSlugInAfterCreate = (strapi, ctx, references) => {
	if (!references.includes('id')) {
		return false;
	}

	return true;
};

const shouldUpdateSlugInBeforeCreate = (strapi, ctx, references) => {
	if (references.includes('id')) {
		return false;
	}

	return true;
};

const shouldUpdateSlugInBeforeUpdate = async (strapi, ctx, references) => {
	const record = await strapi.entityService.findOne(ctx.model.uid, ctx.params.where.id);

	let currentReferenceFieldValues = getReferenceFieldValues(ctx, record, references);
	let referenceFieldValues = getReferenceFieldValues(ctx, ctx.params.data, references);

	// only update if reference a reference field has changed
	if (JSON.stringify(referenceFieldValues) == JSON.stringify(currentReferenceFieldValues)) {
		return false;
	}

	return true;
};

const shouldUpdateSlug = async (strapi, ctx, references) => {
	let shouldUpdate = false;
	if (ctx.action === 'beforeCreate') {
		shouldUpdate = shouldUpdateSlugInBeforeCreate(strapi, ctx, references);
	} else if (ctx.action === 'afterCreate') {
		shouldUpdate = shouldUpdateSlugInAfterCreate(strapi, ctx, references);
	} else if (ctx.action === 'beforeUpdate') {
		shouldUpdate = shouldUpdateSlugInBeforeUpdate(strapi, ctx, references);
	}

	return shouldUpdate;
};

module.exports = {
	shouldUpdateSlug,
};
