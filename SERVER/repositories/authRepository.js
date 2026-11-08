import pool from '../db.js';

// email is CITEXT so no LOWER() needed
export const emailCheckQ = async (email, client = pool) => {
  return client.query(
    'SELECT user_id FROM users WHERE email = $1',
    [email]
  );
};

export const newbieQ = async (client, { firstName, fatherName, email, phone, hashedPassword, homeCampusId }) => {
  return client.query(
    `INSERT INTO users (first_name, father_name, email, phone, password_hash, home_campus_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id, first_name, email, role`,
    [firstName, fatherName, email, phone, hashedPassword, homeCampusId ?? null]
  );
};

export const logInQ = async (email, client = pool) => {
  return client.query(
    `SELECT user_id, first_name, email, password_hash, role, is_banned
     FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
};

// Rotate only if the old one matches and the user is still allowed in
export const updateRefreshTokenQ = async (newRefreshTokenHash, userId, oldRefreshTokenHash, client = pool) => {
  return client.query(
    `UPDATE users
     SET refresh_token = $1
     WHERE user_id = $2 AND refresh_token = $3
       AND is_banned = FALSE AND deleted_at IS NULL
     RETURNING user_id`,
    [newRefreshTokenHash, userId, oldRefreshTokenHash]
  );
};

export const sessionRevokeQ = async (userId, client = pool) => {
  return client.query(
    'UPDATE users SET refresh_token = NULL WHERE user_id = $1',
    [userId]
  );
};

export const refreshTokenLogInQ = async (refreshTokenHash, userId, client = pool) => {
  return client.query(
    'UPDATE users SET refresh_token = $1 WHERE user_id = $2',
    [refreshTokenHash, userId]
  );
};
