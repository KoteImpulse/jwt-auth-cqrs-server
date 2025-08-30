/* eslint-disable @typescript-eslint/unbound-method */
import {Test, TestingModule} from '@nestjs/testing';
import {emailFixtures} from 'src/shared/tests/fixtures';
import {emailMocks} from 'src/shared/tests/mocks';

import {SendEmailHandler} from '../commands/handlers/send-email.handler';
import {SendEmailCommand} from '../commands/implementation/send-email.command';
import {EmailService} from '../email.service';

describe('Command handlers', () => {
	let sendEmailHandler: SendEmailHandler;
	let emailService: jest.Mocked<EmailService>;

	const {mockUser} = emailFixtures;
	const {mockEmailService} = emailMocks;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [SendEmailHandler, {provide: EmailService, useValue: mockEmailService}],
		}).compile();

		sendEmailHandler = module.get(SendEmailHandler);
		emailService = module.get(EmailService);
	});

	describe('', () => {
		it('SendEmailHandler должен быть определен', () => {
			expect(sendEmailHandler).toBeDefined();
		});
	});

	describe('SignupHandler execute', () => {
		it('Должен вызвать emailService.sendEmail с правильными данными', async () => {
			const command = new SendEmailCommand(mockUser.id, mockUser.email);
			await sendEmailHandler.execute(command);

			expect(emailService.sendEmail).toHaveBeenCalledWith(mockUser.id, mockUser.email);
		});
	});
});
