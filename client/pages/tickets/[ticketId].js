import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
	const { doRequest, errors } = useRequest({
		url: '/api/orders',
		method: 'post',
		body: {
			ticketId: ticket.id,
		},
		onSuccess: order => Router.push('/orders/[orderId]',`/orders/${order.id}`),
	});

	return (
		<div>
			<h1>{ticket.title}</h1>
			<h4>Price: {ticket.price}</h4>
			{errors}
			<button onClick={doRequest} className="btn btn-primary">
				Purchase
			</button>
		</div>
	);
};

TicketShow.getInitialProps = async (context,client) =>{
	/**
	 * The name ticketId should not be changed as it's the name of this file.
	 * As next JS in implemented on pages therefore the link path should be a file name following the hirearchy
	 * Therefore [xyz] shows next that it can be dynamic name
	 */
    const {ticketId} = context.query;
    const {data} = await client.get(`/api/tickets/${ticketId}`);

    return {ticket:data};
}

export default TicketShow;
