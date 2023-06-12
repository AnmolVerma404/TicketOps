import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent, OrderStatus } from '@avtickets404/common';

const setup = async () => {
	/**
	 * setup the order cancelled listener and other contents
	 * as ticket does not have orderId, therefore you can just set it. And this will not give error
	 */
	const listener = new OrderCancelledListener(natsWrapper.client);
	const orderId = new mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: 'asfagdf',
	});
	ticket.set({ orderId });
	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg, orderId };
};

it('updates the ticket, publish an event, and acks the message', async () => {
	const { listener, ticket, data, msg, orderId } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalled();
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
