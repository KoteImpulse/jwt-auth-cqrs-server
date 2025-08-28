import {INestApplication} from '@nestjs/common';
import {SwaggerModule} from '@nestjs/swagger';
import {buildSwaggerConfig} from 'src/config/swagger.config';
import {AuthModule} from 'src/modules/auth/auth.module';
import {UserModule} from 'src/modules/user/user.module';

export function setupSwagger(app: INestApplication) {
	const config = buildSwaggerConfig();
	const document = () =>
		SwaggerModule.createDocument(app, config, {
			include: [AuthModule, UserModule],
			operationIdFactory: (cK, mK) => `${cK}---${mK}`,
			extraModels: [],
		});
	SwaggerModule.setup('swagger', app, document, {
		jsonDocumentUrl: '/swagger.json',
		yamlDocumentUrl: '/swagger.yaml',
	});
}
