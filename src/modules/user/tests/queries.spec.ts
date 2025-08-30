/* eslint-disable @typescript-eslint/unbound-method */
import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {userErrors as e} from 'src/shared/consts/user/errors';
import {userFixtures} from 'src/shared/tests/fixtures';
import {userMocks} from 'src/shared/tests/mocks/user/user.mock';

import {GetProfileHandler} from '../queries/handlers/get-profile.handler';
import {GetProfileQuery} from '../queries/implementation/get-profile.query';
import {UserService} from '../user.service';

describe('Query handlers', () => {
	let getProfileHandler: GetProfileHandler;
	let userService: jest.Mocked<UserService>;

	const {mockUser, mockUserWithoutPassword} = userFixtures;
	const {mockUserService, mockQueryBus, mockPrismaService} = userMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [GetProfileHandler, {provide: UserService, useValue: mockUserService}],
		}).compile();

		getProfileHandler = module.get(GetProfileHandler);

		userService = module.get(UserService);
	});

	describe('', () => {
		it('GetProfileHandler должен быть определен', () => {
			expect(getProfileHandler).toBeDefined();
		});
	});

	describe('GetProfileHandler execute', () => {
		it('Должен вернуть пользователя без пароля при валидных входных данных', async () => {
			userService.findUserById.mockResolvedValue(mockUser);
			const query = new GetProfileQuery(mockUser.id);
			const result = await getProfileHandler.execute(query);

			expect(userService.findUserById).toHaveBeenCalledTimes(1);
			expect(userService.findUserById).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUserWithoutPassword);
		});
		it('Должен выбросить NotFoundException если пользователь не найден', async () => {
			userService.findUserById.mockResolvedValue(null);
			const query = new GetProfileQuery(mockUser.id);
			await expect(getProfileHandler.execute(query)).rejects.toThrow(
				new NotFoundException(e.service.getProfile.userNotFound),
			);

			expect(userService.findUserById).toHaveBeenCalledTimes(1);
			expect(userService.findUserById).toHaveBeenCalledWith(mockUser.id);
		});
	});
});
