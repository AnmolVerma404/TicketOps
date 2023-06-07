import {
	NotAuthorizedError,
	NotFoundError,
	requireAuth,
} from '@avtickets404/common';
import express, { Request, Response } from 'express';
import { Order } from '../modals/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req, res) => {
	const order = await Order.findById(req.params.orderId).populate('ticket');

	if (!order) {
		throw new NotFoundError();
	}
	if (order.userId !== req.currentUser!.id) {
		throw new NotAuthorizedError();
	}

	res.send(order);
});

export { router as showOrderRouter };