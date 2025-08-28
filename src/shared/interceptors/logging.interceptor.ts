import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable, tap} from 'rxjs';
import {ReqWithUser} from 'src/modules/auth/types/auth.type';

import {CustomLogger} from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(private readonly logger: CustomLogger) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest<ReqWithUser>();
		const {method, url} = request;
		const now = Date.now();

		this.logger.log(`${method} ${url} ${request.user ? `userId: ${request.user.id}` : ''}`, 'Request');

		return next.handle().pipe(tap(() => this.logger.log(`${method} ${url} ${Date.now() - now}ms`, 'Response')));
	}
}
