import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
	var signin: () => string[];
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

global.signin = () => {
	/**
	 * As we don't have signup service in ticket's therefore don't have the access to JWT tokken
	 * A smart way to get over it is create a fake email & id and from that create a JWT tokken
	 * And perform the base_64 check on it.
	 */
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com',
	};

	const token = jwt.sign(payload, process.env.JWT_KEY!);
	const session = { jwt: token };
	const sessionJSON = JSON.stringify(session);
	const base_64 = Buffer.from(sessionJSON).toString('base64');

	/**
	 * Return it in browser cookie formate
	 * i.e. session=cokkie
	 */
	return [`session=${base_64}`];
};
