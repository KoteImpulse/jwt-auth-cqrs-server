/* eslint-disable @typescript-eslint/unbound-method */
import {ConflictException, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {Test, TestingModule} from '@nestjs/testing';
import type {Request, Response} from 'express';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authFixtures} from 'src/shared/tests/fixtures';
import {mockAuthService, mockCommandBus, mockRequest, mockResponse, mockUserId} from 'src/shared/tests/mocks';

import {AuthController} from '../auth.controller';
import {AuthService} from '../auth.service';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: jest.Mocked<AuthService>;
	let commandBus: jest.Mocked<CommandBus>;
	let response: jest.Mocked<Response>;
	let request: jest.Mocked<Request>;

	const {mockTokens, mockSigninDto, mockSignupDto, mockUserWithoutPassword} = authFixtures;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{provide: AuthService, useValue: mockAuthService},
				{provide: CommandBus, useValue: mockCommandBus},
			],
		}).compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get(AuthService);
		commandBus = module.get(CommandBus);
		response = mockResponse as unknown as jest.Mocked<Response>;
		request = mockRequest as unknown as jest.Mocked<Request>;
	});

	function expectCommandCalledOnceAndNoCookie(mockDto: object) {
		expect(commandBus.execute).toHaveBeenCalledWith(expect.objectContaining(mockDto));
		expect(commandBus.execute).toHaveBeenCalledTimes(1);
		expect(authService.setRefreshCookie).not.toHaveBeenCalled();
	}

	describe('', () => {
		it('AuthController должен определиться', () => {
			expect(authController).toBeDefined();
		});
	});

	describe('signup', () => {
		it('Должен вызвать команду signup и установить refresh cookie', async () => {
			commandBus.execute.mockResolvedValue({user: mockUserWithoutPassword, tokens: mockTokens});
			const result = await authController.signup(mockSignupDto, response);

			expect(commandBus.execute).toHaveBeenCalledWith(expect.objectContaining({signupDto: mockSignupDto}));
			expect(commandBus.execute).toHaveBeenCalledTimes(1);
			expect(authService.setRefreshCookie).toHaveBeenCalledWith(response, mockTokens.refreshToken);
			expect(result).toEqual({user: mockUserWithoutPassword, accessToken: mockTokens.accessToken});
		});

		it('Должен вызвать команду signup и выбросить ConflictException если пользователь существует', async () => {
			commandBus.execute.mockRejectedValue(new ConflictException(e.service.signup.emailAlreadyExists));
			await expect(authController.signup(mockSignupDto, response)).rejects.toThrow(e.service.signup.emailAlreadyExists);

			expectCommandCalledOnceAndNoCookie({signupDto: mockSignupDto});
		});
		it('Должен вызвать команду signup и выбросить InternalServerErrorException если версия токена не определена', async () => {
			commandBus.execute.mockRejectedValue(new InternalServerErrorException(e.service.signup.tokenVersionUndefined));
			await expect(authController.signup(mockSignupDto, response)).rejects.toThrow(
				e.service.signup.tokenVersionUndefined,
			);
			expectCommandCalledOnceAndNoCookie({signupDto: mockSignupDto});
		});
	});

	describe('signin', () => {
		it('Должен вызвать команду signin и установить cookie', async () => {
			commandBus.execute.mockResolvedValue({user: mockUserWithoutPassword, tokens: mockTokens});
			const result = await authController.signin(mockSigninDto, response);

			expect(commandBus.execute).toHaveBeenCalledWith(expect.objectContaining({signinDto: mockSigninDto}));
			expect(commandBus.execute).toHaveBeenCalledTimes(1);
			expect(authService.setRefreshCookie).toHaveBeenCalledWith(response, mockTokens.refreshToken);
			expect(result).toEqual({user: mockUserWithoutPassword, accessToken: mockTokens.accessToken});
		});
		it('Должен вызвать команду signin и выбросить NotFoundException если пользователь не найден', async () => {
			commandBus.execute.mockRejectedValue(new NotFoundException(e.service.signin.userNotFound));
			await expect(authController.signin(mockSigninDto, response)).rejects.toThrow(e.service.signin.userNotFound);

			expectCommandCalledOnceAndNoCookie({signinDto: mockSigninDto});
		});
		it('Должен вызвать команду signin и выбросить InternalServerErrorException если версия токена не определена', async () => {
			commandBus.execute.mockRejectedValue(new InternalServerErrorException(e.service.signin.tokenVersionUndefined));
			await expect(authController.signin(mockSigninDto, response)).rejects.toThrow(
				e.service.signin.tokenVersionUndefined,
			);
			expectCommandCalledOnceAndNoCookie({signinDto: mockSigninDto});
		});
	});

	describe('refresh', () => {
		it('Должен извлечь refresh cookie из запроса, вызвать команду refresh и установить refresh cookie', async () => {
			commandBus.execute.mockResolvedValue({user: mockUserWithoutPassword, tokens: mockTokens});
			authService.extractRefreshToken.mockReturnValue(mockTokens.refreshToken);
			const result = await authController.refresh(request, response);

			expect(commandBus.execute).toHaveBeenLastCalledWith(
				expect.objectContaining({refreshToken: mockTokens.refreshToken}),
			);
			expect(commandBus.execute).toHaveBeenCalledTimes(1);
			expect(authService.extractRefreshToken).toHaveBeenCalledWith(request);
			expect(authService.extractRefreshToken).toHaveBeenCalledTimes(1);
			expect(authService.setRefreshCookie).toHaveBeenCalledWith(response, mockTokens.refreshToken);
			expect(result).toEqual({user: mockUserWithoutPassword, accessToken: mockTokens.accessToken});
		});
		it('Должен выбросить UnauthorizedException если refresh токен не найден', async () => {
			authService.extractRefreshToken.mockReturnValue(null);
			await expect(authController.refresh(request, response)).rejects.toThrow(e.service.refresh.tokenMissing);
			expect(commandBus.execute).not.toHaveBeenCalled();
		});
		it('Должен извлечь refresh cookie из запроса, вызвать команду refresh и выбросить NotFoundException если пользователь не найден', async () => {
			authService.extractRefreshToken.mockReturnValue(mockTokens.refreshToken);
			commandBus.execute.mockRejectedValue(new NotFoundException(e.service.refresh.userNotFound));

			await expect(authController.refresh(request, response)).rejects.toThrow(e.service.refresh.userNotFound);
			expectCommandCalledOnceAndNoCookie({refreshToken: mockTokens.refreshToken});
		});
		it('Должен извлечь refresh cookie из запроса, вызвать команду refresh и выбросить InternalServerErrorException если версия токена не определена', async () => {
			authService.extractRefreshToken.mockReturnValue(mockTokens.refreshToken);
			commandBus.execute.mockRejectedValue(new InternalServerErrorException(e.service.refresh.tokenVersionUndefined));

			await expect(authController.refresh(request, response)).rejects.toThrow(e.service.refresh.tokenVersionUndefined);
			expectCommandCalledOnceAndNoCookie({refreshToken: mockTokens.refreshToken});
		});
	});

	describe('logout', () => {
		it('Должен вызвать команду logout и очистить cookie', async () => {
			commandBus.execute.mockResolvedValue(null);
			await authController.logout(mockUserId, response);

			expect(commandBus.execute).toHaveBeenCalledWith(expect.objectContaining({userId: mockUserId}));
			expect(commandBus.execute).toHaveBeenCalledTimes(1);
			expect(authService.clearRefreshCookie).toHaveBeenCalledWith(response);
			expect(authService.clearRefreshCookie).toHaveBeenCalledTimes(1);
		});
	});
});
