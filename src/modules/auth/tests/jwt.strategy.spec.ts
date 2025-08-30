/* eslint-disable @typescript-eslint/unbound-method */
import {NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authFixtures} from 'src/shared/tests/fixtures';
import {authMocks} from 'src/shared/tests/mocks';

import {AuthService} from '../auth.service';
import {JwtStrategy} from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
	let jwtStrategy: JwtStrategy;
	let authService: jest.Mocked<AuthService>;

	const {mockPayload, mockUserWithoutPassword} = authFixtures;
	const {mockAuthService, mockConfigService} = authMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtStrategy,
				{provide: AuthService, useValue: mockAuthService},
				{provide: ConfigService, useValue: mockConfigService},
			],
		}).compile();

		jwtStrategy = module.get(JwtStrategy);
		authService = module.get(AuthService);
	});

	describe('', () => {
		it('JwtStrategy должна быть определена', () => {
			expect(jwtStrategy).toBeDefined();
		});
	});

	describe('validate', () => {
		it('Должен вернуть пользователя без пароля при валидных входных данных', async () => {
			authService.validateUser.mockResolvedValue(mockUserWithoutPassword);
			const result = await jwtStrategy.validate(mockPayload);

			expect(authService.validateUser).toHaveBeenCalledTimes(1);
			expect(authService.validateUser).toHaveBeenCalledWith(mockPayload.id);
			expect(result).toEqual(mockUserWithoutPassword);
		});
		it('Должен выбросить NotFoundException если пользователь не найден в базе данных', async () => {
			authService.validateUser.mockRejectedValue(new NotFoundException(e.service.validateUser.userNotFound));
			await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(e.service.validateUser.userNotFound);

			expect(authService.validateUser).toHaveBeenCalledTimes(1);
			expect(authService.validateUser).toHaveBeenCalledWith(mockPayload.id);
		});
	});
});
