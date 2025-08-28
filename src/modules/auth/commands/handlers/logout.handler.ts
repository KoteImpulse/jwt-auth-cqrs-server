import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';

import {AuthService} from '../../auth.service';
import {LogoutCommand} from '../implementation/logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
	constructor(private readonly authService: AuthService) {}

	async execute(command: LogoutCommand): Promise<void> {
		const userId = command.userId;
		await this.authService.logout(userId);
	}
}
