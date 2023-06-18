import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@avtickets404/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		/**
		 * @var token will be including infomations like credit card details.
		 * @var orderId defines the order that is making the payment, using which we can search for the user and other information.
		 */
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for an cancelled order');
		}
		/**
		 * RBI have changed some rules, so his method is not working
		 * Try to find a new method
		 */
		// await stripe.charges.create({
		// 	currency: 'inr',
		// 	amount: order.price * 100,
		// 	source: token,
		// });

		/**
		 * This stripe payment method was mentioned in docs
		 * Link -> https://stripe.com/docs/checkout/quickstart?lang=node&client=react
		 * tried many ways but they were not working, so skipping payment part for later
		 */
		// const paymentIntent = await stripe.paymentIntents.create({
		// 	amount: order.price * 100,
		// 	currency: 'inr',
		// 	automatic_payment_methods: {
		// 		enabled: true,
		// 	},
		// 	payment_method_options: {
		// 		card: {
		// 			cvc_token: 'toc_visa',
		// 		},
		// 	},
		// 	// @ts-ignore
		// 	payment_method_data: {
		// 		billing_details: {
		// 			address: {
		// 				city: 'test',
		// 				country: 'test',
		// 				line1: 'test',
		// 				line2: 'test',
		// 				postal_code: 'test',
		// 				state: 'test',
		// 			},
		// 			email: 'test@test.com',
		// 			name: 'test',
		// 			phone: '9876543210',
		// 		},
		// 	},
		// });

		// const customer = await stripe.customers.create({
		// 	email: 'test@test.com',
		// 	source: token,
		// 	name: 'AV',
		// 	address: {
		// 		line1: 'abc',
		// 		postal_code: '123411',
		// 		city: 'Bhopal',
		// 		state: 'MP',
		// 		country: 'India',
		// 	},
		// });
		// const charge = await stripe.charges.create({
		// 	amount: 100 * 100,
		// 	description: 'abc',
		// 	currency: 'INR',
		// 	customer: customer.id,
		// });
		// stripe.paymentIntents.create({
		// 	customer: customer.id,
		// 	amount: 100 * 100,
		// 	description: 'Rails Stripe transaction',
		// 	currency: 'INR',
		// });

		const payment = Payment.build({
			orderId,
			stripeId: 'WAIT_TILL_FRONTEND_FOR_STRIPE_PAYMENT_INTENTS',
		});
		await payment.save();

		// res.send({ clientSecret: paymentIntent.client_secret, success: true });
		res.status(201).send({ success: true });
	}
);

export { router as createChargeRouter };
