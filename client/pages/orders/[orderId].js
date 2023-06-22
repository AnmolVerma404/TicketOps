import { useEffect, useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
			token: 'NO_NEED',
		},
		onSuccess: ({url}) => Router.push(url),
	});

    const checkout = () =>{
        const currentUrl = window.location.href;
        doRequest({currentUrl});
    }

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};
		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);
		return () => {
			clearInterval(timerId);
		};
	}, []);

	if (timeLeft < 0) {
		return <div>Order Expired</div>;
	}

	return (
		<div>
			Time left to pay: {timeLeft} seconds
			{/* <StripeCheckout
            token={({id})=>doRequest({token:id})}
            stripeKey="pk_test_51NJbIzSDBQLRzv161xKsDKrXPMm41OMI4uhPGELWQUhHjhHEEHKpIXsQxsrOjt6u2c8EnJsNiAXcSYkHbzaFeuk700EkPFHtSh"
            amount={order.ticket.price*100}
            email={currentUser.email}
        /> */}
			<button
				onClick={checkout}
			>
				Checkout
			</button>
			{errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
