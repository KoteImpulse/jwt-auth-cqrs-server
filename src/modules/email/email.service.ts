import {Injectable} from '@nestjs/common';

@Injectable()
export class EmailService {
	async sendEmail(userId: string, email: string): Promise<void> {
		console.log(`Отправка welcome письма на ${email} для userId: ${userId}`);
	}
}
