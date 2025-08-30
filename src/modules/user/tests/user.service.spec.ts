/* eslint-disable @typescript-eslint/unbound-method */
import {Test, TestingModule} from '@nestjs/testing';
import {PrismaService} from 'src/core/prisma/prisma.service';
import {userFixtures} from 'src/shared/tests/fixtures';
import {userMocks} from 'src/shared/tests/mocks/user/user.mock';

import {UserService} from '../user.service';

describe('UserService', () => {
	let userService: UserService;
	let prismaService: jest.Mocked<PrismaService>;

	const {mockUser} = userFixtures;
	const {mockPrismaService} = userMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UserService, {provide: PrismaService, useValue: mockPrismaService}],
		}).compile();

		userService = module.get(UserService);
		prismaService = module.get(PrismaService);
	});

	describe('', () => {
		it('UserService должен быть определен', () => {
			expect(userService).toBeDefined();
		});
	});
	describe('checkUserExists', () => {
		it('Должен вернуть true значение если пользователь существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
			const result = await userService.checkUserExists(mockUser.email);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toBe(true);
		});

		it('Должен вернуть false значение если пользователь не существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			const result = await userService.checkUserExists(mockUser.email);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toBe(false);
		});
	});

	describe('createUser', () => {
		it('Должен вернуть создать пользователя и вернуть его значение', async () => {
			mockPrismaService.user.create.mockResolvedValue(mockUser);
			const result = await userService.createUser({
				email: mockUser.email,
				username: mockUser.username,
				password: mockUser.password,
			});

			expect(prismaService.user.create).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
		});
		it('Должен выбросить ошибку если создание пользователя не удалось', async () => {
			mockPrismaService.user.create.mockRejectedValue(new Error('DB error'));

			await expect(
				userService.createUser({
					email: mockUser.email,
					username: mockUser.username,
					password: mockUser.password,
				}),
			).rejects.toThrow('DB error');

			expect(prismaService.user.create).toHaveBeenCalledTimes(1);
		});
	});

	describe('findUserById', () => {
		it('Должен вернуть значение пользователя если он существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
			const result = await userService.findUserById(mockUser.id);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
		});

		it('Должен вернуть null если пользователь не существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			const result = await userService.findUserById(mockUser.id);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toEqual(null);
		});
	});
	describe('findUserByEmail', () => {
		it('Должен вернуть значение пользователя если он существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
			const result = await userService.findUserByEmail(mockUser.email);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUser);
		});

		it('Должен вернуть null если пользователь не существует', async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			const result = await userService.findUserByEmail(mockUser.email);

			expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
			expect(result).toEqual(null);
		});
	});
	describe('incrementRefreshTokenVersion', () => {
		it('Должен вернуть значение пользователя если он существует', async () => {
			mockPrismaService.user.update.mockResolvedValue(mockUser);
			await userService.incrementRefreshTokenVersion(mockUser.id);

			expect(prismaService.user.update).toHaveBeenCalledWith({
				where: {id: mockUser.id},
				data: {refreshTokenVersion: {increment: 1}},
			});
		});
	});
});
