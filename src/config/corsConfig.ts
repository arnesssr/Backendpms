import cors from 'cors';

const allowedOrigins = [
  'https://inventra-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-Timestamp',
    'X-Request-Nonce',
    'X-Request-Signature'
  ],
  credentials: true,
  optionsSuccessStatus: 204
};
