import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	/**
	 * In this test case we create two instance of same ticket
	 * After that we update them.
	 * First we save the first instance then we try to save the second one.
	 * But as we have saved first instance the version is updated therefore the second ticket will give version error
	 */
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: '123',
	});

	await ticket.save();

	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 15 });

	await firstInstance!.save();

	try {
		await secondInstance!.save();
	} catch (error) {
		return;
	}
	throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: '123',
	});

	await ticket.save();
	expect(ticket.version).toEqual(0);

	await ticket.save();
	expect(ticket.version).toEqual(1);

	await ticket.save();
	expect(ticket.version).toEqual(2);
});
