import {User} from '@prisma-client';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';

const mockDate = new Date('2025-01-29T12:00:00.000Z');

const mockUserWithoutPassword: UserWithoutPassword = {
	id: 'id',
	email: 'email@email.com',
	username: 'username',
	refreshTokenVersion: 1,
	createdAt: mockDate,
	updatedAt: mockDate,
};
const mockUser: User = {
	...mockUserWithoutPassword,
	password: 'password',
};

export const emailFixtures = {
	mockDate,
	mockUser,
	mockUserWithoutPassword,
};
