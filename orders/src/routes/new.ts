import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	OrderStatus,
	BadRequestError,
} from '@avtickets404/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		/**
		 * First get the ticketId from the body
		 * Find the ticket associated with that ticket id
		 * If the ticket is not found throw error otherwise continue
		 * Now check the ticket's state, if it's in cancled state it's good to go otherwise it's used someware and you can proceed
		 * Set the ticket expiration date.
		 * Publish the event that a new order is created
		 */

		const { ticketId } = req.body;

		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			throw new NotFoundError();
		}

		const isReserved = await ticket.isReserved();
		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		});
		await order.save();
		console.log('Order done!!!');

		// new OrderCreatedPublisher(natsWrapper.client).publish({
		// 	id: order.id,
		// 	status: order.status,
		// 	userId: order.userId,
		// 	expiresAt: order.expiresAt.toISOString(),
		// 	ticket: {
		// 		id: ticket.id,
		// 		price: ticket.price,
		// 	},
		// });

		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
