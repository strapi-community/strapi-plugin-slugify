'use strict';

const getReferenceFieldValues = (ctx, data, references) => {
	return references
		.filter((referenceField) => {
			// check action specific fields
			if (
				referenceField === 'id' &&
				(ctx.action === 'afterCreate' || ctx.action === 'beforeUpdate')
			) {
				return true;
			}

			// check general data fields
			if (typeof data[referenceField] === 'undefined') {
				return false;
			}

			if (data[referenceField] === null) {
				return false;
			}

			if (typeof data[referenceField] === 'string' && data[referenceField].length === 0) {
				return false;
			}

			return true;
		})
		.map((referenceField) => {
			if (referenceField === 'id') {
				return ctx.result ? ctx.result.id : ctx.params.where.id;
			}

			return data[referenceField];
		});
};

module.exports = {
	getReferenceFieldValues,
};
