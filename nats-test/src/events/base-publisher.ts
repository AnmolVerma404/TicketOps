import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
	subject: Subjects;
	data: any;
}

/**
 * In the main publisher TS file, we can use this Publisher Generic class.
 * This will help to remove typo bugs in publisher subject event.
 * As in the interface we are talomg subject as Subject emum.
 */
export abstract class Publisher<T extends Event> {
	abstract subject: T['subject'];
	private client: Stan;

	constructor(client: Stan) {
		this.client = client;
	}

	publish(data: T['data']) {
		this.client.publish(this.subject, data, () => {
			console.log('Event Published');
		});
	}
}
