const getResolversConfig = () => ({
	Query: {
		findSlug: {
			auth: {
				scope: 'plugin::slugify.slugController.findSlug',
			},
		},
	},
});

module.exports = {
	getResolversConfig,
};
