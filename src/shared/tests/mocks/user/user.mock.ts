const mockQueryBus = {
	execute: jest.fn(),
};
const mockPrismaService = {user: {findUnique: jest.fn(), create: jest.fn(), update: jest.fn()}};
const mockUserService = {findUserById: jest.fn()};

export const userMocks = {
	mockQueryBus,
	mockPrismaService,
	mockUserService,
};
