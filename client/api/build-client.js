import axios from 'axios';

export default ({ req }) => {
	/**
	 * const response = await axios.get('/api/users/currentuser');
	 * Above code will give error, as when this run inside a container.
	 * It's wil send request to 127.0.0.1:80/api/users/currentuser that is inside the container
	 * Not the actual ingress controller. Therefore it will show error
	 * The req prop we get in getInitialProps have all the headers info i.e. host and cookie
	 * In simple word this will run in server on in browser
	 */
	if (typeof window === 'undefined') {
		//server
		/*
		 * We are on the server, as Window Object is only defined on the browser
		 * The request should be made to ingress controller
		 */
		return axios.create({
			baseURL:
				'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		//browser

		/*
		 * We are on the browser,and Window Object is defined on the browser
		 * The request can be made with base string '' i.e. empty
		 */
		return axios.create({
			baseURL: '/',
		});
	}
};
