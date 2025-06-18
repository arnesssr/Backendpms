import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL,         // Production frontend URL
  process.env.DEV_FRONTEND_URL,     // Development frontend URL
  process.env.LOCAL_FRONTEND_URL    // Local development URL
].filter(Boolean); // Remove any undefined values

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-Timestamp',
    'X-Request-Nonce',
    'X-Request-Signature',
    'access-control-allow-origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers'
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false
};
