import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {excludePassword} from 'src/shared/utils/exclude-password.util';

import {AuthService} from '../../auth.service';
import type {CommandExecuteResult} from '../../types/auth.type';
import {RefreshCommand} from '../implementation/refresh.command';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand, CommandExecuteResult> {
	constructor(private readonly authService: AuthService) {}

	async execute(command: RefreshCommand): Promise<CommandExecuteResult> {
		const refreshToken = command.refreshToken;
		const {user, tokens} = await this.authService.refresh(refreshToken);
		const userWithoutPassword = excludePassword(user);
		return {user: userWithoutPassword, tokens};
	}
}
