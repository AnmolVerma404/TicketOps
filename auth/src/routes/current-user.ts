import express from 'express';
import { currentUser } from '@avtickets404/common';

const router = express.Router();

/**
 * As we are using next as frontend
 * Therefore we will use getInitialProps i.e. an inbuild next method
 * This will help to fetch data before site load
 * For example when you visit YouTube it load page and you are signed up
 * It's not like for a sec it will show you are not logged in, and then suddenly you are signed in
 * Therefore getInitialProps will run before rendering the app
 * As this function loads and return's whatever data will be automatically send.
 * It will be send to the respective function as a prop
 */
router.get('/api/users/currentuser', currentUser, (req, res) => {
	res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
