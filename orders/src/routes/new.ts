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

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

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

		/**
		 * This code was throwing error. And it was solved after sometime. But the bug was really interesting. Therefore I thought to right about it.
		 * The OrderCreatedPublisher was throwing error that it's not exported from the common modules.
		 * But the thing was I already update the common module and checked more than 10 time's it was exported.
		 * But after debugging and finding and solving some typos in my code I noticed something.
		 * * 1) The Code editor i.e. VS code was not showing any kind of error, and the export redirection when I "ctrl + (click)" on the OrderCreatedEvent was correct.
		 * * 2) When I looked into the package.json file the version on my npm package was not updated. Then I uninstalled the package and again installed it and code works perfectly fine.
		 * * 3) The error -> When we do npm update <name> it will not change the npm package version in package.json you have to do npm update --save <name> to do so.
		 * * 4) What caused the error -> I am using docker, as the version was not updatad in the package.json, my skaffold was not detecting any change and my docker container was not begin updated thereby the kubernetes pod was not restarting after an packet update. And due to that the export was never done in the container and was showing error.
		 */
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});

		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
