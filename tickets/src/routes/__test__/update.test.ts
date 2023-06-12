import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if provided id is not valid', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'asdav',
			price: 20,
		})
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'asdav',
			price: 20,
		})
		.expect(401);
});

it('returns a 401 if the used does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'asdafa',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'adfadasd',
			price: 100,
		})
		.expect(401);
});

it('returns a 400 if used provide an invalid title or price', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'afasdasd',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 20,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'sadgfadf',
			price: -20,
		})
		.expect(400);
});

it('updates the ticked provided valid input', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'afasdasd',
			price: 20,
		});
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 30,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	expect(ticketResponse.body.title).toEqual('New Title');
	expect(ticketResponse.body.price).toEqual(30);
});

it('publishes an event', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'afasdasd',
			price: 20,
		});
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 30,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'afasdasd',
			price: 20,
		});

	const ticket = await Ticket.findById(response.body.id);
	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 30,
		})
		.expect(400);
});
