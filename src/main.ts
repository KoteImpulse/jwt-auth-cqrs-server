import {ValidationPipe, VersioningType} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import {AppModule} from './app.module';
import {CustomExceptionFilter} from './shared/filters/exсeption.filter';
import {LoggingInterceptor} from './shared/interceptors/logging.interceptor';
import {CustomLogger} from './shared/services/logger.service';
import {isDev} from './shared/utils/is-dev.util';
import {setupSwagger} from './shared/utils/swagger.utils';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {bufferLogs: true});
	const configService = app.get(ConfigService);

	const logger = new CustomLogger(!isDev(configService));
	app.useLogger(logger);

	const PORT = configService.getOrThrow<number>('PORT', 5000);
	const SERVER_URL = configService.getOrThrow<string>('SERVER_URL', 'http://localhost:5000');

	app.setGlobalPrefix('api');
	app.enableVersioning({type: VersioningType.URI, defaultVersion: '1'});

	app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));
	app.useGlobalFilters(new CustomExceptionFilter(logger));
	app.useGlobalInterceptors(new LoggingInterceptor(logger));

	app.enableCors({
		origin: configService.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		exposedHeaders: ['set-cookie'],
		allowedHeaders: ['content-type', 'authorization'],
	});

	app.use(cookieParser([configService.getOrThrow<string>('JWT_SECRET')]));

	if (isDev(configService)) {
		setupSwagger(app);
	}

	await app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}, url ${isDev(configService) ? `${SERVER_URL}` : ''} `);
	});
}

bootstrap();
