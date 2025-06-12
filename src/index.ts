import express from 'express';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API Authentication: Enabled');
  console.log('Accepted API Key:', process.env.API_KEY?.substring(0, 10) + '...');
});