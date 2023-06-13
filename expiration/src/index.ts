import { natsWrapper } from './nats-wrapper';

const start = async () => {
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
	} catch (err) {
		console.error(err);
	}
};

start();
