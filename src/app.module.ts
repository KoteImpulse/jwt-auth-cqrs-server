import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {CqrsModule} from '@nestjs/cqrs';
import {ScheduleModule} from '@nestjs/schedule';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PrismaModule} from './core/prisma/prisma.module';
import {AuthModule} from './modules/auth/auth.module';
import {UserModule} from './modules/user/user.module';
import {LogsCleanupService} from './shared/services/logs-cleanup.service';
import { EmailModule } from './modules/email/email.module';

@Module({
	imports: [
		ConfigModule.forRoot({isGlobal: true}),
		ScheduleModule.forRoot(),
		CqrsModule.forRoot(),
		PrismaModule,
		AuthModule,
		UserModule,
		EmailModule,
	],
	controllers: [AppController],
	providers: [AppService, LogsCleanupService],
})
export class AppModule {}
