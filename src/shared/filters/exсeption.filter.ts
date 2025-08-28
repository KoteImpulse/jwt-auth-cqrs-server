import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import type {Response} from 'express';
import {ReqWithUser} from 'src/modules/auth/types/auth.type';

import {CustomLogger} from '../services/logger.service';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: CustomLogger) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<ReqWithUser>();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const message = exception instanceof Error ? exception.message : `Internal Server Error`;

		this.logger.error(message, exception instanceof Error ? exception.stack : undefined, request.url);

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message,
		});
	}
}
