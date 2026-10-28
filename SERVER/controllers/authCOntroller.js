import * as authServices from '../services/authServices.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../utils/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const signUpC = asyncHandler(async (req, res) => {
  const result = await authServices.signUpS(
    req.body.firstName,
    req.body.middleName,
    req.body.lastName,
    req.body.email,
    req.body.user_password
  );

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  }

  res.status(201).json(result);
});

export const logInC = asyncHandler(async (req, res) => {
  const result = await authServices.logInS(req.body.email, req.body.user_password);

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  }

  res.status(200).json(result);
});

export const refreshTokenC = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authServices.refreshTokenS(incomingRefreshToken);

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  }

  res.status(200).json(result);
});

export const logOutC = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const userId = req.user?.userId || req.user?.userid;

  const result = await authServices.logOutS(incomingRefreshToken, userId);

  const clearCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.clearCookie('refreshToken', clearCookieOptions);
  res.clearCookie('accessToken', clearCookieOptions);

  res.status(200).json(result);
});