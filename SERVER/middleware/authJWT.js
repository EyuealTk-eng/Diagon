import {verifyAccessToken} from '../utils/jwthelpers.js';
import AppError from '../utils/AppError.js'
export function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.cookies?.accessToken;
    if (!token) return next(AppError.unauthorized('AccessToken required.'))
  req.user=verifyAccessToken(token);
    next();}
export default { authToken };