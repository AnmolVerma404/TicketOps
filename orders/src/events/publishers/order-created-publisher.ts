import { Publisher, OrderCreatedEvent, Subjects } from '@avtickets404/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
