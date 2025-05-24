import { setDefaultResultOrder } from 'dns';
import { app } from './app';
import { dbConnect } from './config/database';
import dotenv from 'dotenv';

setDefaultResultOrder('ipv4first');
dotenv.config();

const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    await dbConnect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`- Local: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
