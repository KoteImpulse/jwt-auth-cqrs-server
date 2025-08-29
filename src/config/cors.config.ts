import {ConfigService} from '@nestjs/config';

export function getCorsConfig(configService: ConfigService): any {
	return {
		origin: configService.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		exposedHeaders: ['set-cookie'],
		allowedHeaders: ['content-type', 'authorization'],
	};
}
