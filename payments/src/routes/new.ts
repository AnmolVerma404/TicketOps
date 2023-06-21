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
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

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
		 * This stripe payment method was mentioned in docs
		 * Link -> https://stripe.com/docs/checkout/quickstart?lang=node&client=react
		 * tried many ways but they were not working, so skipping payment part for later
		 */
		console.log('order', order);

		const items = [
			{
				name: 'Temp',
				price: order.price,
				quantity: 1,
			},
		];

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items: items.map(
				(item: { name: any; price: any; quantity: any }) => {
					return {
						price_data: {
							currency: 'inr',
							product_data: {
								name: item.name,
							},
							unit_amount: item.price * 100,
						},
						quantity: item.quantity,
					};
				}
			),
			success_url: 'https://ticketing.dev/orders',
			cancel_url: 'https://ticketing.dev/orders',
		});

		console.log('session=>', session);

		const payment = Payment.build({
			orderId,
			stripeId: session.id,
		});
		await payment.save();

		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		// res.send({ clientSecret: paymentIntent.client_secret, success: true });
		res.status(201).send({ id: payment.id, url: session.url });
	}
);

export { router as createChargeRouter };
