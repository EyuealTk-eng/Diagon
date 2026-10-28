
import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';


const app = express();

// Security headers
app.use(helmet());

const env = {
  port: Number(process.env.PORT) || 3000,
  node_env: process.env.NODE_ENV || 'development',
  client_url: process.env.CLIENT_URL || 'http://localhost:5173',
};
// Cross ORignin REsource sharing
app.use(
  cors({
    origin: env.client_url,
    credentials: true,
  })
);

// Incoming request bodies use JSOOONNNN
app.use(json());

// cookie to javascript Conversion PARSINGG
app.use(cookieParser());


export { app };


// Start the HTTP server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is live on port ${env.port} [${env.node_env}]` );
});

export { server };
