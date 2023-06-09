import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';

const buildTicket = async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	return ticket;
};

it('fetches order for a perticular user', async () => {
	/**
	 * Create three user and get cookie.
	 * Create order. 1 for userOne, and 2 for userTwo
	 * Now fetch the orders from user two, and check if only user's two order are visible.
	 */
	const ticketOne = await buildTicket();
	const ticketTwo = await buildTicket();
	const ticketThree = await buildTicket();

	const userOne = global.signin();
	const userTwo = global.signin();

	// user one order
	await request(app)
		.post('/api/orders')
		.set('Cookie', userOne)
		.send({ ticketId: ticketOne.id })
		.expect(201);

	// user two order
	const { body: orderOne } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ ticketId: ticketTwo.id })
		.expect(201);
	const { body: orderTwo } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ ticketId: ticketThree.id })
		.expect(201);

	// fetch the orders by user two
	const response = await request(app)
		.get('/api/orders')
		.set('Cookie', userTwo)
		.expect(200);

	// checks or orders by user two
	expect(response.body.length).toEqual(2);
	expect(response.body[0].id).toEqual(orderOne.id);
	expect(response.body[1].id).toEqual(orderTwo.id);
	expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
	expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
