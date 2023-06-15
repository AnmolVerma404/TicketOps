import { Listener, OrderCreatedEvent, Subjects } from '@avtickets404/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
		console.log('Waiting this many milliseconds to process the job: ', delay);

		/**
		 * This is the main step where we pass the data to the bull queue
		 */
		await expirationQueue.add(
			{
				orderId: data.id,
			},
			{
				delay,
			}
		);

		msg.ack();
	}
}
