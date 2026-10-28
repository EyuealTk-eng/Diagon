import express from 'express';
import * as authController from '../controllers/authController.js';
import { authToken } from '../middleware/Authjwt.js';
import { strainerAuth } from '../middleware/ratelimiter.js';
import { validate, signUp, regular } from '../middleware/GeneralZOD.js';

const wall = express.Router();

wall.post('/signup', strainerAuth, validate(signUp), authController.signUpC);

wall.post('/login', strainerAuth, validate(regular), authController.logInC);

wall.post('/refresh-token', strainerAuth, authController.refreshTokenC);

wall.post('/logout', authToken, authController.logOutC);

export default wall;