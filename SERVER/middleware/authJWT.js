import {verifyAccessToken} from '../utils/jwthelpers.js';
import AppError from '../utils/AppError.js'
export function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.cookies?.accessToken;
    if (!token) return next(AppError.unauthorized('AccessToken required.'))
      try{
    const decoded =verifyAccessToken(token);
     req.user=decoded; }
     catch(err){
      return next(AppError.unAuthorized('Invalid or Expired Access Token'))
     }
  
    next();}
export default { authToken };