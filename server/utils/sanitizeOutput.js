const { sanitize } = require('@strapi/utils');

const sanitizeOutput = (data, contentType, auth) =>
	sanitize.contentAPI.output(data, contentType, { auth });

module.exports = {
	sanitizeOutput,
};
