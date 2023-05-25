import express, { Request, Response } from 'express';

const router = express.Router();

router.get('api/orders/:orderId', async (req, res) => {
	res.send({});
});

export { router as showOrderRouter };
