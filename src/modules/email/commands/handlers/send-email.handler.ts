import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';

import {EmailService} from '../../email.service';
import {SendEmailCommand} from '../implementation/send-email.command';

@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand, void> {
	constructor(private readonly emailService: EmailService) {}

	async execute(command: SendEmailCommand): Promise<void> {
		const {email, userId} = command;
		await this.emailService.sendEmail(userId, email);
	}
}
