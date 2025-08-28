import {ConsoleLogger, Injectable, LoggerService, LogLevel} from '@nestjs/common';
import {appendFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';

@Injectable()
export class CustomLogger implements LoggerService {
	private readonly consoleLogger = new ConsoleLogger();
	private readonly logDir = join(__dirname, '../../../logs');

	constructor(readonly shouldLog: boolean) {
		if (this.shouldLog && !existsSync(this.logDir)) {
			mkdirSync(this.logDir);
		}
	}

	private writeToFile(level: LogLevel, message: any, context?: string, trace?: string) {
		if (!this.shouldLog) {
			return;
		}
		const [day, time] = new Date().toISOString().split('T');
		const logMessage = `[${day}, ${time.split('.')[0]}] [${level.toUpperCase()}] ${context ? `[${context}]` : ''} ${message} ${trace ? `\nTRACE: ${trace}` : ''}\n`;

		appendFileSync(this.getLogFile(), logMessage);
	}

	private getLogFile(): string {
		const day = new Date().toISOString().split('T')[0];
		return join(this.logDir, `app-${day}.log`);
	}

	log(message: any, context: string) {
		this.writeToFile('log', message, context);
		this.consoleLogger.log(message, context);
	}
	error(message: any, trace?: string, context?: string) {
		this.writeToFile('error', message, context, trace);
		this.consoleLogger.error(message, trace, context);
	}
	warn(message: any, context?: string) {
		this.writeToFile('warn', message, context);
		this.consoleLogger.warn(message, context);
	}
	debug(message: any, context?: string) {
		this.writeToFile('debug', message, context);
		this.consoleLogger.debug(message, context);
	}
	verbose(message: any, context?: string) {
		this.writeToFile('verbose', message, context);
		this.consoleLogger.verbose(message, context);
	}
}
