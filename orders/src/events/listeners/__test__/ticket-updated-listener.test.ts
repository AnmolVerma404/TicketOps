import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketCreatedEvent } from '@avtickets404/common';

const setup = async () => {
	// instance of the listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// create a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const data: TicketCreatedEvent['data'] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: 'new concert',
		price: 999,
		userId: 'afasd',
	};

	// fake msg
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket };
};

it('finds, updates, and saves a ticket', async () => {
	const { msg, data, ticket, listener } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { msg, data, listener } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
