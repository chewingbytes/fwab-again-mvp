# Stargazers Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                   http://localhost:5173                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Screens:                         API Client:                │
│  ├─ Home.tsx                     src/lib/api.ts             │
│  ├─ Login.tsx                    ├─ getUsers()              │
│  ├─ Signup.tsx                   ├─ addUser()               │
│  ├─ Profile.tsx                  ├─ updateUser()            │
│  ├─ Userdashboard.tsx            ├─ deleteUser()            │
│  └─ Eventdashboard.tsx           ├─ loginUser()             │
│                                   ├─ getEvents()             │
│                                   ├─ addEvent()              │
│                                   ├─ updateEvent()           │
│                                   └─ deleteEvent()           │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Fetch Requests
                     │ (JSON)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express Server)                     │
│                   http://localhost:3000                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  server.js (Main Server)                                     │
│  ├─ CORS Middleware                                         │
│  ├─ JSON Parser                                             │
│  └─ Routes:                                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /api/users (User Routes)                          │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  GET    /api/users              → Get all users    │    │
│  │  GET    /api/users/:email       → Get user         │    │
│  │  POST   /api/users              → Create user      │    │
│  │  PUT    /api/users/:email       → Update user      │    │
│  │  DELETE /api/users/:email       → Delete user      │    │
│  │  POST   /api/users/login        → User login       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /api/events (Event Routes)                        │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  GET    /api/events             → Get all events   │    │
│  │  GET    /api/events/:id         → Get event by ID  │    │
│  │  GET    /api/events/name/:name  → Get by name      │    │
│  │  POST   /api/events             → Create event     │    │
│  │  PUT    /api/events/:name       → Update event     │    │
│  │  DELETE /api/events/:name       → Delete event     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ File System (Read/Write)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (JSON Files)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  stargazing.users.json                                       │
│  └─ Array of user objects                                    │
│     ├─ _id (MongoDB-style ObjectId)                         │
│     ├─ username                                              │
│     ├─ email                                                 │
│     ├─ password (bcrypt hashed)                              │
│     ├─ roles (admin/user)                                    │
│     ├─ createdAt                                             │
│     └─ updatedAt                                             │
│                                                              │
│  stargazing.events.json                                      │
│  └─ Array of event objects                                   │
│     ├─ _id (MongoDB-style ObjectId)                         │
│     ├─ id (numeric ID)                                       │
│     ├─ eventName                                             │
│     ├─ eventDate                                             │
│     ├─ startTime                                             │
│     ├─ endTime                                               │
│     ├─ location                                              │
│     ├─ description                                           │
│     └─ participantsLimit                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Example: Adding a New Event

```
1. User fills form in Eventdashboard.tsx
   ↓
2. Frontend calls: await addEvent({ eventName: "...", ... })
   ↓
3. api.ts sends: POST http://localhost:3000/api/events
   Headers: { Content-Type: application/json }
   Body: { eventName, eventDate, startTime, ... }
   ↓
4. Express server receives request
   ↓
5. server/routes/events.js processes request
   ├─ Validates all required fields
   ├─ Reads stargazing.events.json
   ├─ Checks for duplicate event names
   ├─ Generates new ID and _id
   ├─ Adds event to array
   └─ Writes updated array back to JSON file
   ↓
6. Server responds: 201 Created
   Body: { newly created event object }
   ↓
7. Frontend receives response
   ↓
8. Eventdashboard.tsx updates UI
   └─ Shows success toast notification
```

## Key Technologies

- **Frontend**: React, TypeScript, Vite, TanStack Table, Radix UI
- **Backend**: Express.js, Node.js, bcrypt for password hashing
- **Data**: JSON file storage (file system)
- **Communication**: RESTful API with fetch/async-await

## Security Features

✓ Password hashing with bcrypt (10 rounds)
✓ Input validation on both frontend and backend
✓ CORS protection
✓ Email uniqueness validation
✓ Error handling with descriptive messages

## Data Flow Patterns

**Read Operations (GET)**
```
Frontend → API Client → Express Route → Read JSON File → Return Data
```

**Write Operations (POST/PUT/DELETE)**
```
Frontend → API Client → Express Route → Validate → 
Read JSON → Modify Data → Write JSON → Return Result
```

## File Structure

```
stargazers/
├── server/
│   ├── server.js                  # Main Express server
│   ├── routes/
│   │   ├── users.js              # User API routes
│   │   └── events.js             # Event API routes
│   ├── db/
│   │   └── conn.js               # (Optional DB connector)
│   └── authmiddleware.js         # (Optional auth)
│
├── src/
│   ├── lib/
│   │   └── api.ts                # ✨ NEW: API client
│   ├── screens/
│   │   ├── Home.tsx              # ✅ Updated
│   │   ├── Login.tsx             # ✅ Updated
│   │   ├── Signup.tsx            # ✅ Updated
│   │   ├── Profile.tsx           # ✅ Updated
│   │   ├── Userdashboard.tsx     # ✅ Updated
│   │   └── Eventdashboard.tsx    # ✅ Updated
│   └── ...
│
├── stargazing.users.json          # User data
├── stargazing.events.json         # Event data
├── package.json
├── API_SETUP.md                   # Detailed API docs
└── QUICK_START.md                 # Quick start guide
```

## Migration Summary

### Before (Local Data)
```typescript
// Frontend had direct access to JSON via imports
import usersData from '../../../stargazing.users.json';
const users = [...usersData]; // Direct manipulation
```

### After (API-Based)
```typescript
// Frontend makes HTTP requests to Express server
const users = await getUsers(); // Fetch from API
await addUser({ username, email, ... }); // POST to API
```

## Benefits of New Architecture

✅ **Separation of Concerns**: Frontend and backend are independent
✅ **Scalable**: Easy to add authentication, databases, etc.
✅ **RESTful**: Standard API patterns
✅ **Error Handling**: Centralized error management
✅ **Type Safety**: TypeScript interfaces for API calls
✅ **Maintainable**: Clear data flow and single source of truth
✅ **Production Ready**: Can easily switch from JSON to database
