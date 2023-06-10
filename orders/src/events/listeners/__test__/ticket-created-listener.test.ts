import { TicketCreatedEvent } from '@avtickets404/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	// instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// fake data
	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// fake msg
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('creats and saves a ticket', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const ticket = await Ticket.findById(data.id);

	expect(ticket).toBeDefined();
	expect(ticket!.title).toEqual(data.title);
	expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {});
