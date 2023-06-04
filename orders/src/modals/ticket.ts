import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
	title: string;
	price: number;
}
export interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	isReserved(): Promise<boolean>;
}
interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
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

/**
 * What is the difference between using <schamaName>.statics.<methodName> and <schamaName>.methods.<methodName>
 * In statics the build can be accessible by direct Ticket
 * Whereas in methods the function isReserved can only be called by an instance of Ticket
 */

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket(attrs);
};

/**
 * classic function insted of arrow function, because we want to access this keyword.
 */
ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		ticket: this,
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
