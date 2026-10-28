import pool from '../db.js';

export const emailCheckQ = async (email, client = pool) => {
  return client.query(
    'SELECT user_id, email, password_hash FROM user WHERE LOWER(email) = LOWER($1)',
    [email]
  );
};

export const newbieQ = async (client, { firstName, middleName, lastName, email, hashedPassword }) => {
  return client.query(
    `INSERT INTO users (first_name, middle_name, last_name, email, password_hash, username)
     VALUES ($1, $2, $3, $4, $5, $4)
     RETURNING user_id, first_name, middle_name, last_name, email`,
    [firstName, middleName, lastName, email.toLowerCase(), hashedPassword]
  );
};

export const rolePullQ = async (roleName = 'COORDINATOR', client = pool) => {
  return client.query(
    'SELECT role_id FROM elearning.role WHERE UPPER(role_name) = UPPER($1)',
    [roleName]
  );
};

export const roleAssignQ = async (client, userId, roleId) => {
  return client.query(
    'INSERT INTO elearning.user (user_id, role_id) VALUES ($1, $2)',
    [userId, roleId]
  );
};

export const logInQ = async (email, client = pool) => {
  return client.query(
    `SELECT u.user_id, u.first_name, u.email, u.password_hash, r.role_name 
     FROM elearning.app_user u 
     LEFT JOIN elearning.user_role ur ON u.user_id = ur.user_id 
     LEFT JOIN elearning.role r ON ur.role_id = r.role_id 
     WHERE LOWER(u.email) = LOWER($1)`,
    [email]
  );
};

export const updateRefreshTokenQ = async (newRefreshTokenHash, userId, oldRefreshTokenHash, client = pool) => {
  return client.query(
    `UPDATE elearning.app_user
     SET refresh_token = $1
     WHERE user_id = $2 AND refresh_token = $3
     RETURNING user_id`,
    [newRefreshTokenHash, userId, oldRefreshTokenHash]
  );
};

export const sessionRevokeQ = async (userId, client = pool) => {
  return client.query(
    'UPDATE elearning.app_user SET refresh_token = NULL WHERE user_id = $1',
    [userId]
  );
};

export const refreshTokenLogInQ = async (refreshTokenHash, userId, client = pool) => {
  return client.query(
    'UPDATE elearning.app_user SET refresh_token = $1 WHERE user_id = $2',
    [refreshTokenHash, userId]
  );
};