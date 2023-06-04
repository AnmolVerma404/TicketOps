import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../modals/order';
import { Ticket } from '../../modals/ticket';

it('returns an error if ticket does not exist', async () => {
	const ticketId = new mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId,
		})
		.expect(404);
});
it('returns an error if ticket is already reserved', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	const order = Order.build({
		ticket,
		userId: 'asdq2o3rjwdkj',
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(400);
});
it('reserves a ticket', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
});
