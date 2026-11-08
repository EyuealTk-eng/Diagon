import express from 'express';
import * as authController from '../controllers/authController.js';
import { authToken } from '../middleware/authjwt.js';
import limitAuth  from '../middleware/ratelimiter.js';
import { validate, signUp, regular } from '../middleware/GeneralZOD.js';

const auth = express.Router();

auth.post('/signup', limitAuth, validate(signUp), authController.signUpC);

auth.post('/login', limitAuth, validate(regular), authController.logInC);

auth.post('/refresh-token', limitAuth, authController.refreshTokenC);

auth.post('/logout', authToken, authController.logOutC);

export default auth;