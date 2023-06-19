
const LandingPage = ({ currentUser,tickets }) => {
	const ticketList = tickets.map(ticket =>{
		return (
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
			</tr>
		)
	})

	return (
		<div>
			<h1>Tickets</h1>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
					</tr>
				</thead>
				<tbody>
					{ticketList}
				</tbody>
			</table>
		</div>
	);
};

/**
 * As Next JS is a server side rendering framework build upon React JS
 * Therefore getInitialProps is a inbuild Next method on a component
 * Which allows to fetch some data during this process.
 * As this function loads and return's whatever data will be automatically send.
 * It will be send to the respective function as a prop
 * If we log the getInitialProps and main function
 * Whatever is written in the getInitialProps will run first then main function
 * This proves that getInitialProps run's first
 * We can't use custom or any hooks in getInitialProps, as it's not a next function
 * Therefore we need to make a request from axios
 */
LandingPage.getInitialProps = async (context, client, currentUser)=> {
	const {data} = await client.get('/api/tickets');

	return {tickets:data};
};

export default LandingPage;
