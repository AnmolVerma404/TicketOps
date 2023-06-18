import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@avtickets404/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

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
		.expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		userId,
		status: OrderStatus.Cancelled,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'asgfasd',
			orderId: order.id,
		})
		.expect(400);
});

it('returns a 204 with valid inputs', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const price = Math.floor(Math.random() * 100000);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price,
		userId,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201);

	/**
	 * Test for checking if payment was done throught stripe API
	 */
	// const stripeCharges = await stripe.charges.list({ limit: 50 });
	// const stripeCharge = stripeCharges.data.find(charge => {
	// 	return charge.amount === price * 100;
	// });
	// expect(stripeCharge).toBeDefined();
	// expect(stripeCharge!.currency).toEqual('usd');

	/**
	 * Test for cheking if payment id was saved in DB
	 */
	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: 'WAIT_TILL_FRONTEND_FOR_STRIPE_PAYMENT_INTENTS',
	});

	expect(payment).not.toBeNull();
});
