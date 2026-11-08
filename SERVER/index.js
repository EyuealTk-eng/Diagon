
import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './utils/env.js';

import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import AppError from './utils/AppError.js';


const app = express();

// Security headers
app.use(helmet());


// Cross ORignin REsource sharing
app.use(
  cors({
    origin: env.clientURL,
    credentials: true,
  })
);

// Incoming request bodies use JSOOONNNN
app.use(json());

// cookie to javascript Conversion PARSINGG
app.use(cookieParser());

//MOUNT them routes
app.use('/api/auth',authRoutes);

//deal with unhandled routes
app.use((req,res,next)=>{
  next(AppError.notFound(`Can't find ${req.method} ${req.originalUrl} on Diagon`))
})

app.use(errorHandler);

// Start the HTTP server
const server = app.listen(env.PORT, () => {
  console.log(`DIAGON is live on port ${env.port} [${env.node_env}]` );
});

export { app,server };
