import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron, CronExpression} from '@nestjs/schedule';
import {readdirSync, type Stats, statSync, unlinkSync} from 'fs';
import {join} from 'path';

@Injectable()
export class LogsCleanupService {
	private readonly logDir = join(__dirname, '../../../logs');
	private readonly LOGS_MAX_AGE_DAYS: number;
	private readonly logger = new Logger();

	constructor(private readonly configService: ConfigService) {
		this.LOGS_MAX_AGE_DAYS = this.configService.getOrThrow<number>('LOGS_MAX_AGE_DAYS', 2);
	}

	@Cron(CronExpression.EVERY_DAY_AT_11PM)
	handleLogCleanup() {
		let files: string[] = [];

		try {
			files = readdirSync(this.logDir);
		} catch (err) {
			this.logger.error(
				`Не удалось прочитать директорию с файлами: ${(err as Error).message}`,
				'',
				LogsCleanupService.name,
			);
			return;
		}

		const now = Date.now();

		for (const file of files) {
			const filePath = join(this.logDir, file);
			let stat: Stats;
			try {
				stat = statSync(filePath);
				if (!stat.isFile()) continue;
			} catch (err) {
				this.logger.error(
					`Не удалось прочитать статистику файла: ${file}: ${(err as Error).message}`,
					'',
					LogsCleanupService.name,
				);
				continue;
			}

			const ageDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

			if (ageDays > this.LOGS_MAX_AGE_DAYS) {
				try {
					unlinkSync(filePath);
					this.logger.log(`Удалены старые файлы: ${file}`, LogsCleanupService.name);
				} catch (err) {
					this.logger.error(
						`Не удалось удалить старые файлы ${file}: ${(err as Error).message}`,
						'',
						LogsCleanupService.name,
					);
				}
			}
		}
	}
}
