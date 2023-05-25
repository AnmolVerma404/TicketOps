import express, { Request, Response } from 'express';

const router = express.Router();

router.post('api/orders', async (req, res) => {
	res.send({});
});

export { router as newOrderRouter };
