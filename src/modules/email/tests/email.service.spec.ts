import {Test, TestingModule} from '@nestjs/testing';
import {emailFixtures} from 'src/shared/tests/fixtures';

import {EmailService} from '../email.service';

describe('EmailService', () => {
	let emailService: EmailService;

	const {mockUser} = emailFixtures;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [EmailService],
		}).compile();

		emailService = module.get(EmailService);
	});

	describe('', () => {
		it('EmailService должен быть определен', () => {
			expect(emailService).toBeDefined();
		});
	});
	describe('sendEmail', () => {
		it('Должен отправить приветственное письмо', async () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			await emailService.sendEmail(mockUser.id, mockUser.email);

			expect(consoleSpy).toHaveBeenCalledWith(
				`Отправка welcome письма на ${mockUser.email} для userId: ${mockUser.id}`,
			);
		});
	});
});
