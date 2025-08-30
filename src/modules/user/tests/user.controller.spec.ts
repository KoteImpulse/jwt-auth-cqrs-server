/* eslint-disable @typescript-eslint/unbound-method */
import {NotFoundException} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {Test, TestingModule} from '@nestjs/testing';
import {userErrors as e} from 'src/shared/consts/user/errors';
import {userFixtures} from 'src/shared/tests/fixtures';
import {userMocks} from 'src/shared/tests/mocks/user/user.mock';

import {UserController} from '../user.controller';

describe('UserController', () => {
	let userController: UserController;
	let queryBus: jest.Mocked<QueryBus>;

	const {mockUserWithoutPassword, mockUser} = userFixtures;
	const {mockQueryBus} = userMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{provide: QueryBus, useValue: mockQueryBus}],
		}).compile();

		userController = module.get(UserController);
		queryBus = module.get(QueryBus);
	});

	describe('', () => {
		it('UserController должен быть определен', () => {
			expect(userController).toBeDefined();
		});
	});

	describe('getProfile', () => {
		it('Должен вызвать query GetProfileQuery и вернуть данные пользователя', async () => {
			queryBus.execute.mockResolvedValue(mockUserWithoutPassword);
			const result = await userController.getProfile(mockUser.id);

			expect(queryBus.execute).toHaveBeenCalledWith(expect.objectContaining({userId: mockUser.id}));
			expect(queryBus.execute).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUserWithoutPassword);
		});
		it('Должен выбросить NotFoundException если пользователь не найден', async () => {
			queryBus.execute.mockRejectedValue(new NotFoundException(e.service.getProfile.userNotFound));
			await expect(userController.getProfile(mockUser.id)).rejects.toThrow(e.service.getProfile.userNotFound);

			expect(queryBus.execute).toHaveBeenCalledWith(expect.objectContaining({userId: mockUser.id}));
			expect(queryBus.execute).toHaveBeenCalledTimes(1);
		});
	});
});
