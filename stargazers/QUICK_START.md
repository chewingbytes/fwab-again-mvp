# Quick Start Guide

## Start the Application

### Option 1: Run Both Server and Frontend Together (Recommended after installing concurrently)
```bash
npm install -D concurrently
npm run dev:all
```

### Option 2: Run Separately (Two Terminal Windows)

**Terminal 1 - Start the Express Server:**
```bash
npm run server
```
Server will run on: http://localhost:3000

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## Verify Setup

1. Check server health: http://localhost:3000/api/health
2. View all users: http://localhost:3000/api/users
3. View all events: http://localhost:3000/api/events
4. Open frontend: http://localhost:5173

## What Changed?

### ✅ Backend Created
- Express server with REST API
- User routes (CRUD operations)
- Event routes (CRUD operations)
- File-based data storage (JSON)

### ✅ Frontend Updated
- All screens now use `fetch` API calls
- Async/await for data operations
- Centralized API client (`src/lib/api.ts`)
- Removed local data functions

### ❌ Removed
- `src/lib/localData.ts` (replaced by `src/lib/api.ts`)

## Troubleshooting

**Problem:** Frontend can't connect to API
- **Solution:** Make sure the Express server is running on port 3000

**Problem:** CORS errors
- **Solution:** Server has CORS enabled, check if server is running

**Problem:** Changes not persisting
- **Solution:** Check that JSON files have write permissions

## Next Steps

- Add authentication tokens (JWT)
- Add middleware for protected routes
- Add data validation
- Add database (MongoDB, PostgreSQL, etc.)

For detailed API documentation, see `API_SETUP.md`
