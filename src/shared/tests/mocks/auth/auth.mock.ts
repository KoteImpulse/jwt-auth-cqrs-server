export const mockAuthService = {
	setRefreshCookie: jest.fn(),
	signup: jest.fn(),
	signin: jest.fn(),
	extractRefreshToken: jest.fn(),
	clearRefreshCookie: jest.fn(),
};
export const mockCommandBus = {execute: jest.fn()};
export const mockResponse = {cookie: jest.fn(), clearCookie: jest.fn()};
export const mockRequest = {cookies: ''};
export const mockUserId = '123';
