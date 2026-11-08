import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from './env.js';
import AppError from './AppError.js';

// Make the access + refresh pair
export const jwtTokens = ({ userId, email, role, firstName }) => {
  const payload = { userId, email, role, firstName }; // drop iat/exp from old tokens

  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
  // jwtid so two refresh tokens are never the same
  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
    jwtid: crypto.randomUUID(),
  });

  return { accessToken, refreshToken };
};

// Only the hash goes in the DB
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  } catch {
    throw AppError.unauthorized('Access token is invalid or expired.');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  } catch {
    throw AppError.unauthorized('Refresh token is invalid or expired. Please log in again.');
  }
};
