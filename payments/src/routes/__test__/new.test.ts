import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@avtickets404/common';

it('returns a 404 when purchasing an order that does not exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asgfasd',
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asgfasd',
			orderId: order.id,
		})
		.expect(200);
});

it('returns a 400 when purchasing a cancelled order', async () => {});
