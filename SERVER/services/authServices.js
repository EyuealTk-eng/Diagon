import bcrypt from 'bcrypt';
import pool from '../db.js';
import * as authRepo from '../repositories/authRepository.js';
import { jwtTokens, hashToken, verifyRefreshToken } from '../utils/jwthelpers.js';
import AppError from '../utils/AppError.js';
import { roles } from '../utils/constants.js';

export const signUpS = async ({firstName, fatherName,email, password,campusId,phone}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const emailCheck = await authRepo.emailCheckQ(normalizedEmail);
  const phoneCheck= await authRepo.phoneCheckQ(phone.trim());
  if(phoneCheck.rows.length>0){
    throw AppError.conflict('Phone already registered.');
  }
  if (emailCheck.rows.length > 0) {
    throw AppError.conflict('Email is already registered.');
  }


  const client = await pool.connect();
  try {
    await client.query('BEGIN'); 

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await authRepo.newbieQ(client, {
      firstName,
      fatherName,
      email:normalizedEmail,
      phone,
      hashedPassword,
      campusId
    });
    const newUser = userRes.rows[0];


    const tokens = jwtTokens({
      userId: newUser.user_id,
      email: newUser.email,
      role: roles.buyer,
      firstName: newUser.first_name
    });

    await authRepo.refreshTokenLogInQ(hashToken(tokens.refreshToken), newUser.user_id, client);

    await client.query('COMMIT');

    return {
      status: 'OK',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: newUser.user_id,
        firstName: newUser.first_name,
        email: newUser.email,
        role: roles.buyer
      }
    };
  } catch (err) {
    await client.query('ROLLBACK'); 
    throw err;
  } finally {
    client.release();
  }
};

export const logInS = async ({email, password}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const userRes = await authRepo.logInQ(normalizedEmail);

  if (userRes.rows.length === 0) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const user = userRes.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  if (user.is_banned) {
  throw AppError.forbidden('Your account has been suspended.');
}

  const userRole = (user.role || roles.buyer).toUpperCase();

  const tokens = jwtTokens({
    userId: user.user_id,
    firstName: user.first_name,
    email: user.email,
    role: userRole
  });

  await authRepo.refreshTokenLogInQ(hashToken(tokens.refreshToken), user.user_id);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      userId: user.user_id,
      firstName: user.first_name,
      email: user.email,
      role: userRole
    }
  };
};

export const refreshTokenS = async (refreshToken) => {
  if (!refreshToken) {
    throw AppError.badRequest('No refresh token provided.');
  }
let decoded;
  try{
  decoded = verifyRefreshToken(refreshToken);
  }
  catch(err){
  throw AppError.unauthorized('Invalid or expried refresh token. Please log in again.')
  }
  const tokens = jwtTokens(decoded);

  const updateRes = await authRepo.updateRefreshTokenQ(
    hashToken(tokens.refreshToken),
    decoded.userId,
    hashToken(refreshToken)
  );

  if (updateRes.rowCount === 0) {
    throw AppError.unauthorized('Refresh token is invalid or has already been used. Please log in again.');
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      userId: decoded.userId,
      firstName: decoded.firstName,
      email: decoded.email,
      role: decoded.role
    }
  };
};

export const logOutS = async (refreshToken, userId = null) => {
  let targetUserId = userId;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      targetUserId = decoded.userId;
    } catch {
    }
  }

  if (targetUserId) {
    await authRepo.sessionRevokeQ(targetUserId);
  }

  return { message: 'Logged out successfully.' };
};