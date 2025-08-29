import {BadRequestException, type ValidationPipeOptions} from '@nestjs/common';

export function getValidationPipeConfig(): ValidationPipeOptions {
	return {
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		exceptionFactory: (errors) => {
			const message = errors.map((err) => Object.values(err.constraints || {}).join(', ')).join('; ');
			return new BadRequestException(message);
		},
	};
}
