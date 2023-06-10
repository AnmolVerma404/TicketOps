import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
	id: string;
	title: string;
	price: number;
}

export interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	version: number;
	isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
	findByEvent(event: {
		id: string;
		version: number;
	}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

/**
 * What is the difference between using <schamaName>.statics.<methodName> and <schamaName>.methods.<methodName>
 * In statics the build can be accessible by direct Ticket
 * Whereas in methods the function isReserved can only be called by an instance of Ticket
 */
ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket({
		_id: attrs.id,
		title: attrs.title,
		price: attrs.price,
	});
};

/**
 * The next DB query is really important regarding optimistic concurrency control
 * It will se and try to find if the ticket id's version correct or not
 * That is the version that is given by Ticket Microservice should be currVersion - 1
 * Eg -> In ticket MS updation looks like -> 10$ V0 -> 15$ V1 -> 20$ V2
 * Now if we have version 2 TicketUpdatedEvent that means V1 should be present. Otherwise it will cause concurrency issue.
 * To reduce and simplify the code this is implemented in findByEvent.
 */
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
	{
		return Ticket.findOne({
			_id: event.id,
			version: event.version - 1,
		});
	}
};

/**
 * classic function insted of arrow function, because we want to access this keyword.
 */
ticketSchema.methods.isReserved = async function () {
	// this === the ticket document that we just called 'isReserved' on
	const existingOrder = await Order.findOne({
		ticket: this as any,
		status: {
			$in: [
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete,
			],
		},
	});

	/**
	 * !! => first ! if existingOrder is null change it to true, and 2nd ! will change it into false.
	 */
	return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
