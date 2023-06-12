import {
	Listener,
	NotFoundError,
	OrderCreatedEvent,
	Subjects,
} from '@avtickets404/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
	queueGroupName = queueGroupName;
	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		/**
		 * This listener will listen to OrderCreatedEvent
		 * Then will lock the ticket when a user is trying to order it
		 */

		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		ticket.set({ orderId: data.id });
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version,
		});

		msg.ack();
	}
}
