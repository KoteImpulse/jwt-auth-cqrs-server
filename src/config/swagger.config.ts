import {DocumentBuilder} from '@nestjs/swagger';

export function buildSwaggerConfig() {
	const config = new DocumentBuilder()
		.setTitle('JWTAuth')
		.setDescription('JWTAuth + cqrs api')
		.setVersion('0.0.1')
		.setContact('Name', 'Url', 'Email')
		.addBearerAuth()
		.addCookieAuth()
		.build();
	return config;
}
