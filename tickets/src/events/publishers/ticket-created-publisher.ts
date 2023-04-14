import { Publisher, Subjects, TicketCreatedEvent } from '@avtickets404/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
