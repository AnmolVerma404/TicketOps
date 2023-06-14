import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
	orderId: string;
}
/**
 * Bull is a Redis-based system (you might be more familiar with Redis as a tool for quick data storage) and it is a fast and reliable option to consider for task queuing in Node. js. You can use Bull for many tasks such as implementing delayed jobs, scheduled jobs, repeatable jobs, priority queues, and many more
 * Here we are using bull js to implement the delay job.
 * As it couldn't be completed just with setTimeout
 * Reason -> If our system or pod restart it will refrest the setTimeout. And our order that needed to be expired after x amount of time will create error's
 */
const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

expirationQueue.process(async job => {
	new ExpirationCompletePublisher(natsWrapper.client).publish({
		orderId: job.data.orderId,
	});
});

export { expirationQueue };
