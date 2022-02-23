'use strict';

const { registerGraphlQLQuery } = require('./graphql');

module.exports = ({ strapi }) => {
	// add graphql query if present
	if (strapi.plugin('graphql')) {
		strapi.log.info('[slugify] graphql detected, registering queries');
		registerGraphlQLQuery(strapi);
	}
};
