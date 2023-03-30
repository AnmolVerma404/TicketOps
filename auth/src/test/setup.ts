import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
	var signin: () => Promise<string[]>;
}

/**
 * This is a jest hock beforeAll
 * This will run at start with we will run the test
 * This will connect the MongoMemoryServer
 */
let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'asdf';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	/**
	 * await mongoose. connect (mongoUri, {
	 *     useNewUrlParser: true,   <- No need to use this as of mongo V6
	 *     useUnifiedTopology: true <- No need to use this as of mongo V6
	 * });
	 */
	mongoose.set('strictQuery', false);
	await mongoose.connect(mongoUri);
});

/**
 * This will run after a single test is complete
 * This will reset/delete all the collection that are present in the server
 */
beforeEach(async () => {
	/**
	 * As in test we will have same data
	 * Therefore to correctly run we need to delete all the collection
	 */
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signin = async () => {
	const email = 'test@test.com';
	const password = 'password';

	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email,
			password,
		})
		.expect(201);

	const cookie = response.get('Set-Cookie');

	return cookie;
};
