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
	/**
	 * As in real world this NATS streaming servier might be sitting on another location
	 * Therefore we will send a promise of type void
	 * This also shows how async/await is created.
	 * If we remove this promise code, then in the publisher file depending on your IDe will show error or warning that might be similar to compiler saying "there is no need of await here"
	 */
	publish(data: T['data']): Promise<void> {
		return new Promise((resolve, reject) => {
			this.client.publish(this.subject, JSON.stringify(data), err => {
				if (err) {
					return reject(err);
				}
				console.log('Event Published');
				resolve();
			});
		});
	}
}
