# Testing Backend-PMS Connection

This guide explains how to test the connection between PMS (Inventra Frontend) and Backend services.

## Prerequisites

- Backend running on localhost:5000
- PMS running on localhost:5173
- Valid API key configured in both environments
- Supabase database connection

## Environment Setup

1. Backend (.env):
```properties
API_KEY=your_generated_key
PMS_URL=http://localhost:5173
```

2. PMS (.env):
```properties
VITE_API_KEY=your_generated_key
VITE_API_URL=http://localhost:5000
```

## Test Endpoint

Test the API connection using this curl command:

```bash
# Windows PowerShell
curl.exe -X GET -H "X-API-Key: your_generated_key" http://localhost:5000/api/test/test-product

# Linux/Mac Terminal
curl -X GET http://localhost:5000/api/test/test-product -H "X-API-Key: your_generated_key"
```

Expected Response:
```json
{
  "message": "Test endpoint working",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

1. If you get connection refused:
   - Check if backend is running
   - Verify port 5000 is available

2. If you get 401 Unauthorized:
   - Verify API key matches in both .env files
   - Check X-API-Key header format

3. If you get CORS errors:
   - Verify PMS_URL in backend .env
   - Check CORS configuration in app.ts

## Monitoring

1. Check Backend logs:
   - Request details
   - Headers and origin
   - API key validation

2. Check Supabase Dashboard:
   - Database requests
   - API calls
   - Table operations

## Notes

- Keep backend and PMS running in separate terminals
- Use the test endpoint before trying actual operations
- Monitor network tab in browser dev tools
- Check Supabase dashboard for successful connections
