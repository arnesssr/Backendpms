import cors from 'cors';

const ENVIRONMENT = process.env.NODE_ENV || 'development';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const productionOrigins = [process.env.FRONTEND_URL];
    const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5174'];
    
    const allowedOrigins = ENVIRONMENT === 'production' 
      ? productionOrigins
      : [...productionOrigins, ...developmentOrigins];

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
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers'
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

export { corsOptions };
