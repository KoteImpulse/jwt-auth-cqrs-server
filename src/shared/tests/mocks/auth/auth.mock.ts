import {authFixtures} from '../../fixtures';

const mockAuthService = {
	setRefreshCookie: jest.fn(),
	signup: jest.fn(),
	signin: jest.fn(),
	refresh: jest.fn(),
	logout: jest.fn(),
	extractRefreshToken: jest.fn(),
	clearRefreshCookie: jest.fn(),
	validateUser: jest.fn(),
};

const mockEventBus = {
	publish: jest.fn(),
};

const mockCommandBus = {execute: jest.fn()};
const mockResponse = {cookie: jest.fn(), clearCookie: jest.fn()};
const mockRequest = {
	cookies: {refreshToken: authFixtures.mockTokens.refreshToken},
	headers: {refreshToken: authFixtures.mockTokens.refreshToken},
};
const mockUserId = '123';

const mockUserService = {
	checkUserExists: jest.fn(),
	createUser: jest.fn(),
	findUserById: jest.fn(),
	findUserByEmail: jest.fn(),
	incrementRefreshTokenVersion: jest.fn(),
};
const mockJwtService = {
	sign: jest
		.fn()
		.mockReturnValueOnce(authFixtures.mockTokens.accessToken)
		.mockReturnValueOnce(authFixtures.mockTokens.refreshToken),
	verifyAsync: jest.fn(),
};

const getEnv = (key: string) => {
	switch (key) {
		case 'JWT_SECRET':
			return 'jwt_secret';
		case 'JWT_ACCESS_TOKEN_TTL':
			return '2d';
		case 'JWT_REFRESH_TOKEN_TTL':
			return '5d';
		case 'JWT_PEPPER':
			return 'some_pepper';
		case 'NODE_ENV':
			return 'test';
		default:
			break;
	}
};

const mockConfigService = {getOrThrow: jest.fn().mockImplementation((key: string) => getEnv(key))};

export const authMocks = {
	mockAuthService,
	mockEventBus,
	mockCommandBus,
	mockResponse,
	mockRequest,
	mockUserId,
	mockUserService,
	mockJwtService,
	mockConfigService,
};
