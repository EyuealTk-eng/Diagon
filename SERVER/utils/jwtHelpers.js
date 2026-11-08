import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const AccessTokenKey=process.env.ACCESS_TOKEN_SECRET||'emptyJusgoo';
const RefreshTokenKey=process.env.REFRESH_TOKEN_SECRET||'emptyjusgoo';
const AccessTokenExpiresin ='15m';
const RefreshTokenExpiresin='30d';

//Create Them Tokens
export const jwtTokens=({userId,email,role,firstName})=>{
    const payLoad={userId,email,role,firstName};
    const accessToken=jwt.sign(payLoad,AccessTokenKey,{expiresIn:AccessTokenExpiresin,})
    const refreshToken=jwt.sign(payLoad,RefreshTokenKey,{expiresIn:RefreshTokenExpiresin,})
    return {accessToken, refreshToken}
}
//Verify Access Toekn
export const verifyAccessToken=(token)=> {
    return jwt.verify(token,AccessTokenKey)}


    //Verify Refresh Token
export const verifyRefreshToken=(token) =>{
    return jwt.verify(token,RefreshTokenKey)}

    //hashing tokens for stuff
export const hashToken=(token)=> {
    return crypto.createHash('sha256').update(token).digest('hex');
}