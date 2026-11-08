import { env } from '../utils/env.js';

// Last stop for every error
export function errorHandler(err, req, res, next) {
  // Postgres unique violation (email / phone already taken)
  if (err.code === '23505') {
    const field = err.constraint?.includes('phone') ? 'Phone' : 'Email';
    return res.status(409).json({ message: `${field} is already registered.` });
  }

  // Broken JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON.' });
  }

  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.NODE_ENV === 'production' ? 'Something broke on our side.' : err.message,
  });
}
