import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
	return request(app)
		.post('/api/users/signup') // Was errror because of api/ instead of /api/
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
});

it('returns a 400 with an invalid email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'sdfdfagfdaf',
			password: 'password',
		})
		.expect(400);
});

it('returns a 400 with an invalid password', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'p',
		})
		.expect(400);
});

it('returns a 400 with missing email and password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
		})
		.expect(400);
	await request(app)
		.post('/api/users/signup')
		.send({
			password: 'password',
		})
		.expect(400);
});

/**
 * Note that mongo memory server delete all the collection
 * Therefore we need to send a req with email
 * Then send another req with same email
 */
it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('sets a cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);

	expect(response.get('Set-Cookie')).toBeDefined();
});
