import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
	url: 'http://localhost:4222',
});
/**
 * This is not a async await syntax
 * Called a event-driven approact
 * stan nats after connecting will call a connect event
 * Which can be catched by stan
 */
stan.on('connect', () => {
	console.log('Publisher connected to nats');

	// // converts data to string
	// const data = JSON.stringify({
	// 	id: '123',
	// 	title: 'concert',
	// 	price: 20,
	// });

	// // publish data on NATS ticket:create server
	// stan.publish('ticket:created', data, () => {
	// 	console.log('Event Published');
	// });

	const publisher = new TicketCreatedPublisher(stan);
	publisher.publish({
		id: '123',
		title: 'Concert',
		price: 20,
	});
});
/**
 * Port-forwarding
 * kubectl port-forward nats-depl-abc-xyz PORT1:PORT2
 * PORT1 is the local machine port, PORT2 is the Container service port
 * nats-depl-abc-xyz is the name of the deployment of which we dont't want to additionaly create a Cluster-IP or Node-Port service.
 * This method is a fast/local/testing/temporary way to expose a port from a docker container to our local machine
 */
