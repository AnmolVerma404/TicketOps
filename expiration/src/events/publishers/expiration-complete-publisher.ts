import {
	ExpirationCompleteEvent,
	Publisher,
	Subjects,
} from '@avtickets404/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
