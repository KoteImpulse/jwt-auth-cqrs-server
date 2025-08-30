/* eslint-disable @typescript-eslint/unbound-method */
import {ConflictException, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {EventBus} from '@nestjs/cqrs';
import {Test, TestingModule} from '@nestjs/testing';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authFixtures} from 'src/shared/tests/fixtures';
import {authMocks} from 'src/shared/tests/mocks';

import {AuthService} from '../auth.service';
import {LogoutHandler} from '../commands/handlers/logout.handler';
import {RefreshHandler} from '../commands/handlers/refresh.handler';
import {SigninHandler} from '../commands/handlers/singin.handler';
import {SignupHandler} from '../commands/handlers/singup.handler';
import {LogoutCommand} from '../commands/implementation/logout.command';
import {RefreshCommand} from '../commands/implementation/refresh.command';
import {SigninCommand} from '../commands/implementation/singin.command';
import {SignupCommand} from '../commands/implementation/singup.command';

describe('Command handlers', () => {
	let signupHandler: SignupHandler;
	let signinHandler: SigninHandler;
	let refreshHandler: RefreshHandler;
	let logoutHandler: LogoutHandler;
	let eventBus: jest.Mocked<EventBus>;
	let authService: jest.Mocked<AuthService>;

	const {mockTokens, mockSigninDto, mockSignupDto, mockUser, mockUserWithoutPassword} = authFixtures;
	const {mockAuthService, mockEventBus} = authMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SignupHandler,
				SigninHandler,
				RefreshHandler,
				LogoutHandler,
				{provide: EventBus, useValue: mockEventBus},
				{provide: AuthService, useValue: mockAuthService},
			],
		}).compile();

		signupHandler = module.get(SignupHandler);
		signinHandler = module.get(SigninHandler);
		refreshHandler = module.get(RefreshHandler);
		logoutHandler = module.get(LogoutHandler);
		eventBus = module.get(EventBus);
		authService = module.get(AuthService);
	});

	describe('', () => {
		it('SignupHandler должен быть определен', () => {
			expect(signupHandler).toBeDefined();
		});
		it('SigninHandler должен быть определен', () => {
			expect(signinHandler).toBeDefined();
		});
		it('RefreshHandler должен быть определен', () => {
			expect(refreshHandler).toBeDefined();
		});
		it('LogoutHandler должен быть определен', () => {
			expect(logoutHandler).toBeDefined();
		});
	});

	describe('SignupHandler execute', () => {
		it('Должен вернуть пользователя без пароля и токены при валидных входных данных', async () => {
			authService.signup.mockResolvedValue({user: mockUser, tokens: mockTokens});
			const command: SignupCommand = {signupDto: mockSignupDto};
			const result = await signupHandler.execute(command);

			expect(authService.signup).toHaveBeenCalledTimes(1);
			expect(authService.signup).toHaveBeenCalledWith(mockSignupDto);
			expect(eventBus.publish).toHaveBeenCalledTimes(1);
			expect(eventBus.publish).toHaveBeenCalledWith(
				expect.objectContaining({userId: mockUser.id, email: mockUser.email}),
			);
			expect(result).toEqual({user: mockUserWithoutPassword, tokens: mockTokens});
		});
		it('Должен выбросить ConflictException если authService.signup выбросил ошибку', async () => {
			authService.signup.mockRejectedValue(new ConflictException(e.service.signup.emailAlreadyExists));
			await expect(signupHandler.execute({signupDto: mockSignupDto})).rejects.toThrow(
				e.service.signup.emailAlreadyExists,
			);

			expect(eventBus.publish).toHaveBeenCalledTimes(0);
		});
	});
	describe('SigninHandler execute', () => {
		it('Должен вернуть пользователя без пароля и токены при валидных входных данных', async () => {
			authService.signin.mockResolvedValue({user: mockUser, tokens: mockTokens});
			const command: SigninCommand = {signinDto: mockSigninDto};
			const result = await signinHandler.execute(command);

			expect(authService.signin).toHaveBeenCalledTimes(1);
			expect(authService.signin).toHaveBeenCalledWith(mockSigninDto);
			expect(result).toEqual({user: mockUserWithoutPassword, tokens: mockTokens});
		});
		it('Должен выбросить NotFoundException если authService.signin выбросил ошибку', async () => {
			authService.signin.mockRejectedValue(new NotFoundException(e.service.signin.userNotFound));
			await expect(signinHandler.execute({signinDto: mockSigninDto})).rejects.toThrow(e.service.signin.userNotFound);
			expect(authService.signin).toHaveBeenCalledTimes(1);
		});
	});
	describe('RefreshHandler execute', () => {
		it('Должен вернуть пользователя без пароля и токены при валидных входных данных', async () => {
			authService.refresh.mockResolvedValue({user: mockUser, tokens: mockTokens});
			const command: RefreshCommand = {refreshToken: mockTokens.refreshToken};
			const result = await refreshHandler.execute(command);

			expect(authService.refresh).toHaveBeenCalledTimes(1);
			expect(authService.refresh).toHaveBeenCalledWith(mockTokens.refreshToken);
			expect(result).toEqual({user: mockUserWithoutPassword, tokens: mockTokens});
		});
		it('Должен выбросить UnauthorizedException если authService.refresh выбросил ошибку', async () => {
			authService.refresh.mockRejectedValue(new UnauthorizedException(e.service.refresh.tokenMissing));
			await expect(refreshHandler.execute({refreshToken: mockTokens.refreshToken})).rejects.toThrow(
				e.service.refresh.tokenMissing,
			);
			expect(authService.refresh).toHaveBeenCalledTimes(1);
		});
	});
	describe('LogoutHandler execute', () => {
		it('Должен вызвать метод logout с userId', async () => {
			authService.logout.mockImplementation();
			const command: LogoutCommand = {userId: mockUser.id};
			await logoutHandler.execute(command);

			expect(authService.logout).toHaveBeenCalledTimes(1);
			expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
		});
	});
});
