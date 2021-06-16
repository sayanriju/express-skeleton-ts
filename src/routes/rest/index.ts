import express, { RequestHandler } from 'express';
const router = express.Router();

import expressJwt, { secretType } from 'express-jwt';

const checkJwt: RequestHandler = expressJwt({
  secret: <secretType>process.env.SECRET,
  algorithms: ['HS256'],
}); // the JWT auth check middleware

import * as login from './auth';
import * as signup from './auth/signup';
import * as forgotpassword from './auth/password';
import * as users from './users';

router.post('/login', login.post); // UNAUTHENTICATED
router.post('/signup', signup.post); // UNAUTHENTICATED
router.post('/forgotpassword', forgotpassword.startWorkflow); // UNAUTHENTICATED; AJAX
router.post('/resetpassword', forgotpassword.resetPassword); // UNAUTHENTICATED; AJAX

router.all('*', checkJwt); // use this auth middleware for ALL subsequent routes

router.get('/users', users.find);
router.get('/user/:id', users.get);
router.post('/user', users.post);
router.put('/user/:id', users.put);
router.delete('/user/:id', users.del);

export { router };
