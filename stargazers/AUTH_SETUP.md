# JWT Authentication & Role-Based Authorization Setup

## Overview

Complete JWT authentication system with HTTP-only cookies, role-based access control, and session persistence.

## Architecture

### Backend Authentication Flow

```
1. User signs up/logs in with credentials
   ↓
2. Server validates credentials & hashes password (bcrypt)
   ↓
3. JWT token generated with user data (email, username, roles)
   ↓
4. Token set in HTTP-only cookie (secure, not accessible by JS)
   ↓
5. Client automatically sends cookie with each request
   ↓
6. Middleware verifies token from cookie
   ↓
7. Route either executes (if authorized) or returns 403 Forbidden
```

## Key Features

### ✅ JWT Token
- **Generated on**: Login & Signup
- **Expiry**: 7 days
- **Storage**: HTTP-only cookie
- **Secret**: From `.env` (`JWT_TOKEN`)

### ✅ Role-Based Authorization
- **Admin**: Can manage users and events, access dashboards
- **User**: Can view events, edit own profile

### ✅ Protected Routes
- `/profile` - Requires authentication
- `/userdashboard` - Requires admin role
- `/eventdashboard` - Requires admin role
- `/` & `/login` & `/signup` - Public

### ✅ Session Persistence
- Token persists in cookie across page reloads
- `AuthContext.useEffect` restores user session on app load

## Backend Files

### `server/authmiddleware.js`
Middleware for token verification and role checking:

```javascript
export const verifyToken = (req, res, next)
// Verifies JWT from cookies, attaches user to req.user

export const requireRole = (roles)
// Checks if user has required role

export const optionalAuth = (req, res, next)
// Verifies token if present, doesn't require it
```

### `server/routes/users.js`
Authentication endpoints:

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/auth/signup` | POST | None | Register new user |
| `/auth/login` | POST | None | User login |
| `/auth/logout` | POST | Required | Clear cookie |
| `/me` | GET | Required | Get current user |
| `/` | GET | Admin | List all users |
| `/:email` | GET | Admin | Get user by email |
| `/` | POST | Admin | Create user |
| `/:email` | PUT | Required* | Update user |
| `/:email` | DELETE | Admin | Delete user |

*Users can update their own profile, admins can update anyone

### `server/routes/events.js`
Event endpoints with role-based access:

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/` | GET | Optional | List events |
| `/:id` | GET | Optional | Get event by ID |
| `/name/:name` | GET | Optional | Get event by name |
| `/` | POST | Admin | Create event |
| `/:name` | PUT | Admin | Update event |
| `/:name` | DELETE | Admin | Delete event |

## Frontend Files

### `src/contexts/AuthContext.tsx`
Global authentication state management:

```typescript
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (user) => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export function useAuth() // Hook to access auth state
```

Features:
- Restores user session on app load
- Manages login/logout/signup
- Provides `isAdmin` and `isAuthenticated` flags
- Centralized error handling

### `src/lib/api.ts`
Updated API client with cookie support:

```typescript
const fetchOptions = {
  credentials: 'include' // Send cookies with requests
}

export async function signupUser(user) // Register
export async function loginUser(credentials) // Login
export async function logoutUser() // Logout
export async function getCurrentUser() // Get current user
// ... other endpoints
```

All requests include `credentials: 'include'` to send/receive cookies

### `src/components/ProtectedRoute.tsx`
Route wrapper for authorization:

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminComponent />
</ProtectedRoute>
```

Features:
- Redirects unauthenticated users to `/login`
- Redirects unauthorized users to `/profile`
- Shows loading state during auth check
- Supports optional role requirements

### `src/screens/`

**Login.tsx**
- Uses `useAuth()` hook
- Calls `login()` on submit
- Redirects to `/profile` on success

**Signup.tsx**
- Uses `useAuth()` hook
- Calls `signup()` on submit
- Redirects to `/` on success

**Profile.tsx**
- Shows current user's info
- Allows editing username/email
- Shows role-based UI
- Logout button clears session

**Userdashboard.tsx** & **Eventdashboard.tsx**
- Protected with admin role check
- Redirects non-admins away
- Full CRUD operations for admins

## Environment Configuration

Create `.env` file in project root:

```env
PORT=3000
JWT_TOKEN=your-very-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Testing the Auth System

### 1. Sign Up
```bash
POST http://localhost:3000/api/users/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "message": "Signup successful",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "roles": "user"
  }
}
```

Cookie set: `token=<jwt>`

### 2. Access Protected Route
```bash
GET http://localhost:3000/api/users/me
(Cookie automatically included)
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "roles": "user"
  }
}
```

### 3. Try Admin Route (Should Fail for User)
```bash
GET http://localhost:3000/api/users
(User role will be rejected)
```

Response:
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

## Frontend Usage

### In Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAdmin, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      {isAdmin && <AdminPanel />}
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### In Routes

```typescript
<ProtectedRoute>
  <UserProfile />
</ProtectedRoute>

<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

## Security Features

✅ **HTTP-only Cookies**
- Token not accessible by JavaScript (prevents XSS)
- Automatically sent with requests

✅ **Secure Flag**
- Enabled in production (`secure: NODE_ENV === 'production'`)
- Only sent over HTTPS

✅ **SameSite Policy**
- Set to `lax` - prevents CSRF attacks

✅ **Password Hashing**
- bcrypt with 10 rounds
- Never store plain text passwords

✅ **Token Verification**
- JWT verified on every protected route
- Invalid/expired tokens rejected

✅ **Role-Based Access**
- Server-side role enforcement
- Cannot bypass by modifying client code

## Error Handling

### Common Errors

**401 Unauthorized - No Token**
```json
{
  "message": "Unauthorized: No token provided"
}
```

**403 Forbidden - Invalid Role**
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "error": "Invalid credentials"
}
```

**400 Bad Request - Duplicate Email**
```json
{
  "error": "Email already exists"
}
```

## Logout Flow

```
1. User clicks logout
   ↓
2. Frontend calls logoutUser()
   ↓
3. POST /api/users/auth/logout
   ↓
4. Server clears cookie (expires=past date)
   ↓
5. AuthContext.user = null
   ↓
6. UI updates, redirects to home
```

## Session Restoration

```
1. App loads
   ↓
2. AuthContext.useEffect runs
   ↓
3. Calls getCurrentUser()
   ↓
4. Cookie automatically sent
   ↓
5. Server validates token
   ↓
6. User restored without re-login
```

## Adding New Protected Routes

1. Create route component
2. Wrap in `<ProtectedRoute requiredRole="admin">`
3. Use `useAuth()` hook for user data
4. Server automatically enforces role checks

## Migrating Existing Routes

```typescript
// Before
<Route path="/dashboard" element={<Dashboard />} />

// After
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute requiredRole="admin">
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Troubleshooting

**Cookie Not Being Set**
- Check CORS credentials: `include`
- Verify server sets `httpOnly: true`
- Check browser dev tools > Application > Cookies

**Session Lost After Reload**
- Verify JWT_TOKEN in .env
- Check token expiry (7 days)
- Ensure getCurrentUser() is called on mount

**User Can Access Admin Routes**
- Check user roles in JSON file
- Verify requireRole middleware is applied
- Check ProtectedRoute in router

**CORS Errors**
- Frontend must be on `http://localhost:5173`
- Server CORS origin should match
- Check `credentials: 'include'` in API calls
