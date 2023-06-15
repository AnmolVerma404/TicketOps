import {
	Listener,
	OrderCancelledEvent,
	OrderStatus,
	Subjects,
} from '@avtickets404/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;
	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		/**
		 * We are decreasing the version by 1 because, when the xyz publisher send's this event, then it also increase the version of the order.
		 * Therefore to find the event when we listen to the event, we need to decrease it by 1.
		 */
		const order = await Order.findOne({
			_id: data.id,
			version: data.version - 1,
		});

		if (!order) {
			throw new Error('Order not found');
		}

		order.set({ status: OrderStatus.Cancelled });
		await order.save();

		msg.ack();
	}
}
