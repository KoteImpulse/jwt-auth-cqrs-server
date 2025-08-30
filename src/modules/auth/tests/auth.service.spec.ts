/* eslint-disable @typescript-eslint/unbound-method */
import {
	ConflictException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import type {Request, Response} from 'express';
import {UserService} from 'src/modules/user/user.service';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authFixtures} from 'src/shared/tests/fixtures';
import {authMocks} from 'src/shared/tests/mocks';

import {AuthService} from '../auth.service';

describe('AuthService', () => {
	let authService: AuthService;
	let userService: jest.Mocked<UserService>;
	let response: jest.Mocked<Response>;
	let request: jest.Mocked<Request>;
	let genTokens: jest.SpyInstance;
	let verifyPass: jest.SpyInstance;

	const {mockTokens, mockSigninDto, mockSignupDto, mockUser, mockPayload, mockUserWithoutPassword} = authFixtures;
	const {mockConfigService, mockJwtService, mockRequest, mockResponse, mockUserService} = authMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{provide: UserService, useValue: mockUserService},
				{provide: ConfigService, useValue: mockConfigService},
				{provide: JwtService, useValue: mockJwtService},
			],
		}).compile();

		authService = module.get(AuthService);
		userService = module.get(UserService);
		response = mockResponse as unknown as jest.Mocked<Response>;
		request = mockRequest as unknown as jest.Mocked<Request>;

		genTokens = jest.spyOn(authService as any, 'generateTokens');
		verifyPass = jest.spyOn(authService as any, 'verifyPassword');
	});

	function expectVerAndGenCalledTimesFindUser(verTimes: number, genTimes: number) {
		expect(verifyPass).toHaveBeenCalledTimes(verTimes);
		expect(genTokens).toHaveBeenCalledTimes(genTimes);
		expect(userService.findUserByEmail).toHaveBeenCalledTimes(1);
		expect(userService.findUserByEmail).toHaveBeenCalledWith(mockSigninDto.email);
	}

	describe('', () => {
		it('AuthService должен быть определен', () => {
			expect(authService).toBeDefined();
		});
	});

	describe('signup', () => {
		it('Должен вернуть пользователя и токены при валидных входных данных', async () => {
			userService.checkUserExists.mockResolvedValue(false);
			userService.createUser.mockResolvedValue(mockUser);
			const result = await authService.signup(mockSignupDto);

			expect(userService.createUser).toHaveBeenCalledTimes(1);
			expect(result).toEqual({user: mockUser, tokens: mockTokens});
		});
		it('Должен выбросить ConflictException если пользователь уже существует', async () => {
			userService.checkUserExists.mockResolvedValue(true);
			await expect(authService.signup(mockSignupDto)).rejects.toThrow(
				new ConflictException(e.service.signup.emailAlreadyExists),
			);
			expect(userService.createUser).toHaveBeenCalledTimes(0);
		});
		it('Должен выбросить InternalServerErrorException если пользователь не создался', async () => {
			userService.checkUserExists.mockResolvedValue(false);
			userService.createUser.mockResolvedValue(null);

			await expect(authService.signup(mockSignupDto)).rejects.toThrow(
				new InternalServerErrorException(e.service.signup.userNotCreated),
			);

			expect(userService.createUser).toHaveBeenCalledTimes(1);
		});
		it('Должен выбросить InternalServerErrorException если версия токена не определена', async () => {
			userService.checkUserExists.mockResolvedValue(false);
			userService.createUser.mockResolvedValue({...mockUser, refreshTokenVersion: null});

			await expect(authService.signup(mockSignupDto)).rejects.toThrow(
				new InternalServerErrorException(e.service.signup.tokenVersionUndefined),
			);
			expect(userService.createUser).toHaveBeenCalledTimes(1);
		});
	});
	describe('signin', () => {
		it('Должен вернуть пользователя и токены при валидных входных данных', async () => {
			userService.findUserByEmail.mockResolvedValue(mockUser);
			verifyPass.mockResolvedValue(true);

			genTokens.mockReturnValue(mockTokens);
			const result = await authService.signin(mockSigninDto);

			expectVerAndGenCalledTimesFindUser(1, 1);

			expect(genTokens).toHaveBeenCalledWith(mockUser.id, mockUser.refreshTokenVersion);
			expect(result).toEqual({user: mockUser, tokens: mockTokens});
		});
		it('Должен выбросить NotFoundException если пользователь не найден', async () => {
			userService.findUserByEmail.mockResolvedValue(null);
			await expect(authService.signin(mockSigninDto)).rejects.toThrow(
				new NotFoundException(e.service.signin.userNotFound),
			);
			expectVerAndGenCalledTimesFindUser(0, 0);
		});
		it('Должен выбросить NotFoundException если пароль не верен', async () => {
			userService.findUserByEmail.mockResolvedValue(mockUser);
			verifyPass.mockResolvedValue(false);

			await expect(authService.signin(mockSigninDto)).rejects.toThrow(
				new NotFoundException(e.service.signin.userNotFound),
			);
			expectVerAndGenCalledTimesFindUser(1, 0);
		});
		it('Должен выбросить NotFoundException если пароль не верен', async () => {
			userService.findUserByEmail.mockResolvedValue({...mockUser, refreshTokenVersion: null});
			verifyPass.mockResolvedValue(true);

			await expect(authService.signin(mockSigninDto)).rejects.toThrow(
				new InternalServerErrorException(e.service.signin.tokenVersionUndefined),
			);
			expectVerAndGenCalledTimesFindUser(1, 0);
		});
	});

	describe('refresh', () => {
		it('Должен вернуть пользователя и новые токены при валидном refresh токене', async () => {
			mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
			userService.findUserById.mockResolvedValue(mockUser);
			genTokens.mockReturnValue(mockTokens);
			const result = await authService.refresh(mockTokens.refreshToken);

			expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
			expect(userService.findUserById).toHaveBeenCalledTimes(1);
			expect(userService.findUserById).toHaveBeenCalledWith(mockPayload.id);
			expect(genTokens).toHaveBeenCalledTimes(1);
			expect(result).toEqual({user: mockUser, tokens: mockTokens});
		});
		it('Должен выбросить UnauthorizedException если токен не валидный', async () => {
			mockJwtService.verifyAsync.mockResolvedValue({...mockPayload, id: null});
			await expect(authService.refresh(mockTokens.refreshToken)).rejects.toThrow(
				new UnauthorizedException(e.service.refresh.tokenMissing),
			);
			expect(userService.findUserById).toHaveBeenCalledTimes(0);
			expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
		});
		it('Должен выбросить NotFoundException если пользователь не найден в базе данных', async () => {
			mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
			userService.findUserById.mockResolvedValue(null);

			await expect(authService.refresh(mockTokens.refreshToken)).rejects.toThrow(
				new NotFoundException(e.service.refresh.userNotFound),
			);
			expect(userService.findUserById).toHaveBeenCalledTimes(1);
			expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
		});
	});

	describe('logout', () => {
		it('Должен вызвать метод для инкремента версии токена', async () => {
			userService.incrementRefreshTokenVersion.mockImplementation();
			await authService.logout(mockUser.id);

			expect(userService.incrementRefreshTokenVersion).toHaveBeenCalledTimes(1);
		});
	});
	describe('validateUser', () => {
		it('Должен вернуть пользователя без пароля', async () => {
			userService.findUserById.mockResolvedValue(mockUser);
			const result = await authService.validateUser(mockUser.id);

			expect(userService.findUserById).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUserWithoutPassword);
		});
		it('Должен выбросить NotFoundException если пользователь не найден в базе данных', async () => {
			userService.findUserById.mockResolvedValue(null);
			await expect(authService.validateUser(mockUser.id)).rejects.toThrow(
				new NotFoundException(e.service.validateUser.userNotFound),
			);

			expect(userService.findUserById).toHaveBeenCalledTimes(1);
		});
	});
	describe('extractRefreshToken', () => {
		it('Должен вернуть значение refresh токена из cookie', () => {
			expect(authService.extractRefreshToken(request)).toEqual(mockRequest.cookies.refreshToken);
		});
		it('Должен вернуть значение refresh токена из заголовка если cookie нет', () => {
			expect(authService.extractRefreshToken({...request, cookies: {}})).toBe(mockRequest.headers.refreshToken);
		});
		it('Должен вернуть null если токен не найден ни в headers ни в cookies', () => {
			expect(authService.extractRefreshToken({...request, cookies: {}, headers: {}})).toBe(null);
		});
	});
	describe('setRefreshCookie', () => {
		it('setRefreshCookie должен вызвать response.cookie с правильными параметрами', () => {
			authService.setRefreshCookie(response, mockTokens.refreshToken);
			expect(response.cookie).toHaveBeenCalledWith(
				'refreshToken',
				mockTokens.refreshToken,
				expect.objectContaining({expires: expect.any(Date)}),
			);
		});
	});
	describe('clearRefreshCookie', () => {
		it('clearRefreshCookie должен вызвать response.clearCookie с правильными параметрами', () => {
			authService.clearRefreshCookie(response);
			expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', expect.objectContaining({}));
		});
	});
});
