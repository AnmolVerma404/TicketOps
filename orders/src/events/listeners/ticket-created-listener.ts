import { Listener, Subjects, TicketCreatedEvent } from '@avtickets404/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../modals/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		const { id, title, price } = data;
		const ticket = Ticket.build({
			id,
			title,
			price,
		});
		await ticket.save();

		msg.ack();
	}
}
