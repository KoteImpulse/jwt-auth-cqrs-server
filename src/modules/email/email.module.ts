import {Module} from '@nestjs/common';

import {EmailCommandHandlers} from './commands/handlers';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';

@Module({
	imports: [],
	controllers: [EmailController],
	providers: [EmailService, ...EmailCommandHandlers],
})
export class EmailModule {}
