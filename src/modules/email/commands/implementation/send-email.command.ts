import {ICommand} from '@nestjs/cqrs';

export class SendEmailCommand implements ICommand {
	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {}
}
