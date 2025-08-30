import {Controller} from '@nestjs/common';

import {EmailService} from './email.service';

@Controller({path: 'email', version: '1'})
export class EmailController {
	constructor(private readonly emailService: EmailService) {}
}
