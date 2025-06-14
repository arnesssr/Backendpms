export const testConfig = {
  apiUrl: process.env.NODE_ENV === 'test' 
    ? 'http://localhost:5000/api'  // Local testing
    : 'your backend',  // CI/CD testing
  apiKey: process.env.API_KEY
}
