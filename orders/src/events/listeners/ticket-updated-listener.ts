import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@avtickets404/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		/**
		 * The next DB query is really important regarding optimistic concurrency control
		 * It will se and try to find if the ticket id's version correct or not
		 * That is the version that is given by Ticket Microservice should be currVersion - 1
		 * Eg -> In ticket MS updation looks like -> 10$ V0 -> 15$ V1 -> 20$ V2
		 * Now if we have version 2 TicketUpdatedEvent that means V1 should be present. Otherwise it will cause concurrency issue.
		 * To reduce and simplify the code this is implemented in findByEvent.
		 */
		const ticket = await Ticket.findByEvent(data);

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		const { title, price } = data;
		ticket.set({ title, price });
		await ticket.save();

		msg.ack();
	}
}
