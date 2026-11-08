import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env.js';
import wall from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';


const app = express();

// Security headers
app.use(helmet());

// Cross ORignin REsource sharing
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Incoming request bodies use JSOOONNNN
app.use(json());

// cookie to javascript Conversion PARSINGG
app.use(cookieParser());

// is it alive
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Auth wall
app.use('/api/auth', wall);

// Nothing here
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Errors land here LAST
app.use(errorHandler);


export { app };


// Start the HTTP server
const server = app.listen(env.PORT, () => {
  console.log(`Server is live on port ${env.PORT} [${env.NODE_ENV}]`);
});

export { server };
