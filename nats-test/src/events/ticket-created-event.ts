import { Subjects } from './subjects';

/**
 * Using this method we can take care of type checking
 * In future if we have multiple event's we can just list them out here.
 */
export interface TicketCreatedEvent {
	subject: Subjects.TicketCreated;
	data: {
		id: string;
		title: string;
		price: number;
	};
}
