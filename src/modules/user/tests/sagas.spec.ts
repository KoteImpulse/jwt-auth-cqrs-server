import {Test, TestingModule} from '@nestjs/testing';
import {firstValueFrom, of} from 'rxjs';
import {take} from 'rxjs/operators';
import {SendEmailCommand} from 'src/modules/email/commands/implementation/send-email.command';
import {userFixtures} from 'src/shared/tests/fixtures';

import {UserCreatedEvent} from '../events/user-created.event';
import {UserCreatedSaga} from '../sagas/user-created.saga';

describe('Query handlers', () => {
	let userCreatedSaga: UserCreatedSaga;

	const {mockUser} = userFixtures;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UserCreatedSaga],
		}).compile();

		userCreatedSaga = module.get(UserCreatedSaga);
	});

	describe('', () => {
		it('UserCreatedSaga должна быть определена', () => {
			expect(userCreatedSaga).toBeDefined();
		});
	});

	describe('UserCreatedSaga', () => {
		it('Должен преобразовать UserCreatedEvent в SendEmailCommand', async () => {
			const event = new UserCreatedEvent(mockUser.id, mockUser.email);

			const result = await firstValueFrom(userCreatedSaga.userCreated(of(event)).pipe(take(1)));

			expect(result).toBeInstanceOf(SendEmailCommand);
			const sendEmailCommand = result as SendEmailCommand;
			expect(sendEmailCommand.userId).toBe(event.userId);
			expect(sendEmailCommand.email).toBe(event.email);
		});
	});
});
