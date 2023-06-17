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
		// 	currency: 'usd',
		// 	amount: order.price * 100,
		// 	source: token,
		// });

		/**
		 * This stripe payment method was mentioned in docs
		 * Link -> https://stripe.com/docs/checkout/quickstart?lang=node&client=react
		 */
		const paymentIntent = await stripe.paymentIntents.create({
			amount: order.price * 100,
			currency: 'inr',
			automatic_payment_methods: {
				enabled: true,
			},
		});
		res.send({ success: true });
	}
);

export { router as createChargeRouter };
