export const authValidation = {
	signup: {
		email: {min: 5, max: 50},
		username: {min: 5, max: 50, pattern: /^[a-zA-Z0-9_.-]+$/},
		password: {min: 5},
	},
	signin: {
		email: {min: 5, max: 50},
		password: {min: 5},
	},
};
