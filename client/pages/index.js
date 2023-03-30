import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
	return currentUser ? (
		<h1>You are signed in</h1>
	) : (
		<h1>You are not signed in</h1>
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
LandingPage.getInitialProps = async context => {
    console.log('Landing Page!');
	const client = buildClient(context);
	const { data } = await client.get('/api/users/currentuser');
	return data;
};

export default LandingPage;
