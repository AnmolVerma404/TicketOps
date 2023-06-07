import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);

		/**
		 * This is implemented here not in the modules, as we don't want our package to have the ability to close connection
		 * Instead user can close when ever they want
		 */
		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed!');
			process.exit();
		});

		process.on('SiGINT', () => natsWrapper.client!.close()); // ctrl + s || rs the server
		process.on('SIGTERM', () => natsWrapper.client!.close()); // ctrl + c terminate the terminal

		new TicketCreatedListener(natsWrapper.client).listen();
		new TicketUpdatedListener(natsWrapper.client).listen();

		/**
		 * This will allow us to connect to a local database of mongoDB.
		 * As this will be running inside a container.
		 * We need to give the service name and the port number.
		 * As of Mongoose v6, Do not add the options object.
		 * That options object have properties like useNewUrlParser:true and some more properties
		 */
		mongoose.set('strictQuery', false);
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log(`Running on http://localhost:${3000}`);
	});
};

start();
