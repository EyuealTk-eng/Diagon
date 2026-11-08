import pool from '../db.js';

export const emailCheckQ = async (email, client = pool) => {
  return client.query(
    'SELECT user_id FROM users WHERE email = $1',
    [email]
  );
};

export const phoneCheckQ = async (phone, client = pool) => {
  return client.query(
    'SELECT user_id FROM users WHERE phone = $1',
    [phone]
  );
};

export const newbieQ = async (client, { firstName, fatherName, email, phone, hashedPassword, campusId = null }) => {
  return client.query(
    `INSERT INTO users (first_name, father_name, email, phone, password_hash, home_campus_id, role)
     VALUES ($1, $2, $3, $4, $5, $6, 'buyer')
     RETURNING user_id, first_name, father_name, email, phone, role`,
    [firstName, fatherName, email, phone, hashedPassword, campusId]
  );
};
export const logInQ = async (email, client = pool) => {
  return client.query(
    `SELECT user_id, first_name, father_name, email, password_hash, role, is_banned
     FROM users 
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
};
//update refresh token
export const updateRefreshTokenQ = async (newRefreshTokenHash, userId, oldRefreshTokenHash, client = pool) => {
  return client.query(
    `UPDATE users 
     SET refresh_token_hash = $1 
     WHERE user_id = $2 AND refresh_token_hash = $3
     RETURNING user_id`,
    [newRefreshTokenHash, userId, oldRefreshTokenHash]
  );
};

// Logout
export const sessionRevokeQ = async (userId, client = pool) => {
  return client.query(
    'UPDATE users SET refresh_token_hash = NULL WHERE user_id = $1',
    [userId]
  );
};

export const refreshTokenLogInQ = async (refreshTokenHash, userId, client = pool) => {
  return client.query(
    'UPDATE users SET refresh_token_hash = $1 WHERE user_id = $2',
    [refreshTokenHash, userId]
  );
};