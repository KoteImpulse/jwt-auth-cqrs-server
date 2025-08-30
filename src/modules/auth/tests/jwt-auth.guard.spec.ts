import {ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {authFixtures} from 'src/shared/tests/fixtures';

import {JwtAuthGuard} from '../guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
	let jwtAuthGuard: JwtAuthGuard;

	const {mockUser} = authFixtures;

	beforeEach(() => {
		jwtAuthGuard = new JwtAuthGuard();
	});

	describe('', () => {
		it('JwtAuthGuard должен быть определен', () => {
			expect(jwtAuthGuard).toBeDefined();
		});
	});

	describe('JwtAuthGuard handleRequest', () => {
		it('Должен вернуть пользователя если токен валидный', () => {
			const result = jwtAuthGuard.handleRequest(null, mockUser, null, {} as ExecutionContext);
			expect(result).toEqual(mockUser);
		});

		it('Должен выбросить UnauthorizedException если ошибка есть', () => {
			expect(() => jwtAuthGuard.handleRequest(new Error(), null, null, {} as ExecutionContext)).toThrow(
				UnauthorizedException,
			);
		});

		it('Должен выбросить UnauthorizedException если пользователь отсутствует', () => {
			expect(() => jwtAuthGuard.handleRequest(null, null, null, {} as ExecutionContext)).toThrow(UnauthorizedException);
		});
	});
});
