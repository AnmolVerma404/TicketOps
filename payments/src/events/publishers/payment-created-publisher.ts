import { PaymentCreatedEvent, Publisher, Subjects } from '@avtickets404/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
