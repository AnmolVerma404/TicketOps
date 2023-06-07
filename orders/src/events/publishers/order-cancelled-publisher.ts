import { OrderCancelledEvent, Publisher, Subjects } from '@avtickets404/common';

export class OrderCreatedPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
