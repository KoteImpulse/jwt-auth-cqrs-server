import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {map, Observable} from 'rxjs';
import {SendEmailCommand} from 'src/modules/email/commands/implementation/send-email.command';

import {UserCreatedEvent} from '../events/user-created.event';

@Injectable()
export class UserCreatedSaga {
	@Saga()
	userCreated = (events$: Observable<any>): Observable<ICommand> => {
		return events$.pipe(
			ofType(UserCreatedEvent),
			map((event) => new SendEmailCommand(event.userId, event.email)),
		);
	};
}
