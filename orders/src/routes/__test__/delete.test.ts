import request from 'supertest';
import { Ticket } from '../../modals/ticket';
import { app } from '../../app';
import { Order, OrderStatus } from '../../modals/order';

it('marks an order as cancelled', async () => {
	/**
	 * Create a ticket, then make an order
	 * Cancel that order
	 * Check if the order was cancelled
	 */
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	const { body: response } = await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204);

	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emit an order cancelled event');
