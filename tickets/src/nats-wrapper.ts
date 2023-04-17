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
	 * @param clusterId is cid that we defined in infra of nats
	 */
	connect(clusterId: string, clientId: string, url: string) {
		this._client = nats.connect(clusterId, clientId, { url });

		return new Promise<void>((resolve, reject) => {
			this._client!.on('connect', () => {
				console.log('Connected to NATS');
				resolve();
			});
			this._client!.on('error', err => {
				reject(err);
			});
		});
	}
}

export const natsWrapper = new NatsWrapper();
