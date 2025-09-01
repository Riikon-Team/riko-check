import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const appConfig = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        connectSrc: ["'self'", "*"],
        frameSrc: ["'self'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"]
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }),

  cors: cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),

  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
  }),

  morgan: morgan('combined'),
  
  compression: compression()
};
