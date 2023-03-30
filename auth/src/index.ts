import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	try {
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
