import {User} from '@prisma-client';
import {SigninDto} from 'src/modules/auth/dto/signin.dto';
import {SignupDto} from 'src/modules/auth/dto/signup.dto';
import {IPayload, Tokens} from 'src/modules/auth/types/auth.type';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';

const mockDate = new Date('2025-01-29T12:00:00.000Z');

const mockTokens: Tokens = {accessToken: 'access_token', refreshToken: 'refresh_token'};

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

const mockPayload: IPayload = {
	id: mockUser.id,
	version: mockUser.refreshTokenVersion,
};

const mockSignupDto: SignupDto = {
	username: 'userName',
	email: 'email@email.email',
	password: 'password',
};

const mockSigninDto: SigninDto = {
	email: 'email@email.email',
	password: 'password',
};

export const authFixtures = {
	mockDate,
	mockTokens,
	mockUserWithoutPassword,
	mockUser,
	mockSignupDto,
	mockSigninDto,
	mockPayload,
};
