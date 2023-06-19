import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
	return (
		<div>
			<Header currentUser={currentUser} />
			<Component currentUser={currentUser} {...pageProps} />
		</div>
	);
};

AppComponent.getInitialProps = async appContext => {
	const client = buildClient(appContext.ctx);
	const { data } = await client.get('/api/users/currentuser');

	let pageProps = {};
	/**
	 * This check is for SignUp and SignIn Page
	 */
	if (appContext.Component.getInitialProps) {
		pageProps = await appContext.Component.getInitialProps(appContext.ctx,client,data,currentUser);
	}

	console.log(pageProps);

	return {
		pageProps,
		...data,
	};
};

export default AppComponent;
