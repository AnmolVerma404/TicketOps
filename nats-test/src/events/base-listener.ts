import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
	subject: Subjects;
	data: any;
}

/**
 * abstract class will be defined in sub class of Listener
 */
export abstract class Listener<T extends Event> {
	abstract subject: T['subject'];
	abstract queueGroupName: string;
	abstract onMessage(data: T['data'], msg: Message): void;
	private client: Stan;
	protected ackWait = 5 * 1000;

	constructor(client: Stan) {
		this.client = client;
	}

	subscriptionOptions() {
		return this.client
			.subscriptionOptions()
			.setDeliverAllAvailable() // When a new service come, this send's all the past msg's to the service
			.setManualAckMode(true)
			.setAckWait(this.ackWait)
			.setDurableName(this.queueGroupName); // If the service restart's the already delivered msg's do not get sent again
	}

	listen() {
		/**
		 * @argument 1st subscribe to the ticket... server
		 * @argument 2nd kind of load balancer which works by maintaining a queue so differenct server get only one request. Algo -> Round Robin, may be different in some case.
		 */
		const subscription = this.client.subscribe(
			this.subject,
			this.queueGroupName, // This will not resent all the msg via options, as they are already resent in one of the listener
			this.subscriptionOptions()
		);

		subscription.on('message', (msg: Message) => {
			console.log(`Message recieved: ${this.subject} / ${this.queueGroupName}`);
			const parsedData = this.parseMessage(msg);
			this.onMessage(parsedData, msg);
		});
	}

	parseMessage(msg: Message) {
		const data = msg.getData();
		return typeof data === 'string'
			? JSON.parse(data)
			: JSON.parse(data.toString('utf-8'));
	}
}
