require('dotenv').config({path: './.env.test'});

module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '../../src/',
	testRegex: '.e2e-spec.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/$1',
		'^@shared/(.*)$': '<rootDir>/shared/$1',
		'^@prisma-client$': '<rootDir>/../generated/prisma',
	},
};
