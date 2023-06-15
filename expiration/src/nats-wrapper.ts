import nats, { Stan } from 'node-nats-streaming';

/**
 * In packages like mongoose we need not to initiate mongodb client on every file
 * Normally we just initialize it in index.* file and do whatever we want
 * Similar kind of behaviour we want to expect with nats
 * Therefore it's necessary to create a wrapper class and return it's instance
 * That instance can be imported****
 */
class NatsWrapper {
	private _client?: Stan;

	/**
	 * get and set are javascript @keyword
	 * @keyword set is used to set a property from outside a class
	 * @keyword get is used to retrieve a value that is private in a class
	 * Similar concept is used in Java Beans
	 * as the private @var _client have "_", these have some positives
	 * therefore we can just easily get client from nats-wrapper.
	 */

	get client() {
		if (!this._client) {
			throw new Error('Cannot access NATS client before connecting');
		}

		return this._client;
	}

	/**
	 * @param clusterId is cid that we defined in infra of nats
	 */
	connect(clusterId: string, clientId: string, url: string) {
		this._client = nats.connect(clusterId, clientId, { url });

		return new Promise<void>((resolve, reject) => {
			this.client.on('connect', () => {
				console.log('Connected to NATS');
				resolve();
			});
			this.client.on('error', err => {
				reject(err);
			});
		});
	}
}

export const natsWrapper = new NatsWrapper();
