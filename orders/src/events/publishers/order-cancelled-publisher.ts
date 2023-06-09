import { Subjects, Publisher, OrderCancelledEvent } from '@avtickets404/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
