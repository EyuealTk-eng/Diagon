import bcrypt from 'bcrypt';
import pool from '../db.js';
import * as authRepo from '../repositories/authRepository.js';
import { jwtTokens, hashToken, verifyRefreshToken } from '../utils/jwthelpers.js';
import AppError from '../utils/AppError.js';
import { ROLES } from '../utils/constants.js';

export const signUpS = async (firstName, middleName, lastName, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const emailCheck = await authRepo.emailCheckQ(normalizedEmail);
  if (emailCheck.rows.length > 0) {
    throw AppError.conflict('Email is already registered.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); 

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await authRepo.newbieQ(client, {
      firstName,
      middleName,
      lastName,
      email: normalizedEmail,
      hashedPassword
    });
    const newUser = userRes.rows[0];

    const roleRes = await authRepo.rolePullQ(ROLES.COORDINATOR, client);
    if (roleRes.rows.length === 0) {
      throw AppError.internal('Default coordinator role is not configured in the database.');
    }
    await authRepo.roleAssignQ(client, newUser.user_id, roleRes.rows[0].role_id);

    const tokens = jwtTokens({
      userId: newUser.user_id,
      email: newUser.email,
      role: ROLES.COORDINATOR,
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
        role: ROLES.COORDINATOR
      }
    };
  } catch (err) {
    await client.query('ROLLBACK'); 
    throw err;
  } finally {
    client.release();
  }
};

export const logInS = async (email, password) => {
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

  const userRole = (user.role_name || ROLES.COORDINATOR).toUpperCase();

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

  const decoded = verifyRefreshToken(refreshToken);

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