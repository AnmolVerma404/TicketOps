import express, { Request, Response } from 'express';

const router = express.Router();

router.delete('api/orders/:orderId', async (req, res) => {
	res.send({});
});

export { router as deleteOrderRouter };
