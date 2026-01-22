# Stargazers API Setup Guide

## Overview
The application has been refactored to use an Express server with RESTful API routes that interact with JSON data files. All frontend components now use `fetch` calls instead of local data functions.

## Architecture

### Backend (Express Server)
- **Server**: `server/server.js`
- **Routes**: 
  - `server/routes/users.js` - User management endpoints
  - `server/routes/events.js` - Event management endpoints
- **Data Files**:
  - `stargazing.users.json` - User data
  - `stargazing.events.json` - Event data

### Frontend
- **API Client**: `src/lib/api.ts` - All API calls centralized
- **Screens**: Updated to use async/await with fetch calls

## API Endpoints

### Users API (`/api/users`)

#### GET `/api/users`
Get all users
```javascript
const users = await getUsers();
```

#### GET `/api/users/:email`
Get user by email
```javascript
const user = await getUserByEmail('user@example.com');
```

#### POST `/api/users`
Create new user
```javascript
await addUser({
  username: 'john',
  email: 'john@example.com',
  password: 'Password123',
  roles: 'user'
});
```

#### PUT `/api/users/:email`
Update user by email
```javascript
await updateUser('user@example.com', {
  username: 'newname',
  email: 'newemail@example.com'
});
```

#### DELETE `/api/users/:email`
Delete user by email
```javascript
await deleteUser('user@example.com');
```

#### POST `/api/users/login`
User login
```javascript
const user = await loginUser({
  username: 'john',
  email: 'john@example.com',
  password: 'Password123'
});
```

### Events API (`/api/events`)

#### GET `/api/events`
Get all events
```javascript
const events = await getEvents();
```

#### GET `/api/events/:id`
Get event by ID
```javascript
const event = await getEventById(1);
```

#### GET `/api/events/name/:eventName`
Get event by name
```javascript
const event = await getEventByName('Lunar Eclipse Watch');
```

#### POST `/api/events`
Create new event
```javascript
await addEvent({
  eventName: 'Star Party',
  eventDate: '2025-03-15',
  startTime: '20:00',
  endTime: '23:00',
  location: 'Observatory Hill',
  description: 'Monthly star party',
  participantsLimit: 50
});
```

#### PUT `/api/events/:eventName`
Update event by name
```javascript
await updateEvent('Star Party', {
  description: 'Updated description',
  participantsLimit: 60
});
```

#### DELETE `/api/events/:eventName`
Delete event by name
```javascript
await deleteEvent('Star Party');
```

## Running the Application

### 1. Install Dependencies
```bash
cd stargazers
npm install
```

### 2. Start the Express Server
```bash
node server/server.js
```
The server will run on `http://localhost:3000`

### 3. Start the Frontend (in a separate terminal)
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Updated Files

### Backend Files Created/Modified:
- ✅ `server/server.js` - Main Express server
- ✅ `server/routes/users.js` - Complete user CRUD operations
- ✅ `server/routes/events.js` - Complete event CRUD operations

### Frontend Files Created/Modified:
- ✅ `src/lib/api.ts` - NEW: Centralized API client
- ✅ `src/screens/Home.tsx` - Uses `getEvents()` API
- ✅ `src/screens/Login.tsx` - Uses `loginUser()` API
- ✅ `src/screens/Signup.tsx` - Uses `addUser()` API
- ✅ `src/screens/Profile.tsx` - Uses `getUsers()` and `updateUser()` APIs
- ✅ `src/screens/Userdashboard.tsx` - Uses all user APIs
- ✅ `src/screens/Eventdashboard.tsx` - Uses all event APIs
- ❌ `src/lib/localData.ts` - DELETED (replaced by api.ts)

## Key Features

### Error Handling
All API calls include proper error handling with try/catch blocks and user-friendly error messages displayed via toast notifications.

### Password Security
- Passwords are hashed using bcrypt (10 rounds)
- Login validates hashed passwords
- Default password for admin-created users: `defaultstargazersPassword`

### Data Persistence
All changes are persisted to the JSON files:
- `stargazing.users.json`
- `stargazing.events.json`

### CORS Support
The server has CORS enabled to allow frontend requests from different ports.

## Development Tips

1. **Check Server Status**: Visit `http://localhost:3000/api/health`
2. **View Raw Data**: Access JSON files directly to see stored data
3. **Test API**: Use tools like Postman or curl to test endpoints
4. **Debug**: Check server console for error logs

## Example Usage

### Adding a User from Frontend
```typescript
try {
  await addUser({
    username: 'stargazer',
    email: 'stargazer@example.com',
    password: 'SecurePass123',
    roles: 'user'
  });
  toast.success('User created!');
} catch (error) {
  toast.error(error.message);
}
```

### Fetching Events
```typescript
async function loadEvents() {
  try {
    const events = await getEvents();
    setEvents(events);
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}
```

## Environment Configuration

The server uses environment variables from `.env`:
- `PORT` - Server port (default: 3000)
- Other variables as needed

## Notes

- All API functions are async and return Promises
- Frontend must have the server running to function properly
- JSON files are the source of truth for data
- No database required - data is file-based
