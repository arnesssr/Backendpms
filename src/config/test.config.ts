export const testConfig = {
  apiUrl: process.env.NODE_ENV === 'test' 
    ? 'http://localhost:5000/api'  // Local testing
    : 'https://your-backend.onrender.com/api',  // CI/CD testing
  apiKey: process.env.API_KEY
}
