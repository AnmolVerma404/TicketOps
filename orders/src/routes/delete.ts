import express, { Request, Response } from 'express';
import {
	requireAuth,
	NotFoundError,
	NotAuthorizedError,
} from '@avtickets404/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const { orderId } = req.params;

		const order = await Order.findById(orderId).populate('ticket');

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		order.status = OrderStatus.Cancelled;
		await order.save();

		console.log('Order cancelled!!!');

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
		new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});

		res.status(204).send(order);
	}
);

export { router as deleteOrderRouter };
