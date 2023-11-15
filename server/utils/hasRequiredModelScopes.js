const hasRequiredModelScopes = (strapi, uid, auth) =>
	strapi.auth.verify(auth, { scope: `${uid}.find` });

module.exports = {
	hasRequiredModelScopes,
};
