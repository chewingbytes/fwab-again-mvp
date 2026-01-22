const API_BASE_URL = 'http://localhost:3000/api';

const fetchOptions = {
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include' as const, 
};

// Auth API calls
export async function signupUser(user: {
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  return response.json();
}

export async function loginUser(credentials: {
  username?: string;
  email?: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/users/auth/logout`, {
    method: 'POST',
    ...fetchOptions,
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    ...fetchOptions,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response.json();
}

// User API calls (admin only for most)
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    ...fetchOptions,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function getUserByEmail(email: string) {
  const response = await fetch(`${API_BASE_URL}/users/${email}`, {
    ...fetchOptions,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export async function addUser(user: {
  username: string;
  email: string;
  password?: string;
  roles?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    ...fetchOptions,
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add user');
  }
  return response.json();
}

export async function updateUser(
  email: string,
  updates: {
    username?: string;
    email?: string;
    password?: string;
    roles?: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/users/${email}`, {
    method: 'PUT',
    ...fetchOptions,
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  return response.json();
}

export async function deleteUser(email: string) {
  const response = await fetch(`${API_BASE_URL}/users/${email}`, {
    method: 'DELETE',
    ...fetchOptions,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
  return response.json();
}

// Event API calls
export async function getEvents() {
  const response = await fetch(`${API_BASE_URL}/events`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}

export async function getEventById(id: number) {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

export async function getEventByName(eventName: string) {
  const response = await fetch(`${API_BASE_URL}/events/name/${eventName}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

export async function addEvent(event: {
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  participantsLimit: number;
}) {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    ...fetchOptions,
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add event');
  }
  return response.json();
}

export async function updateEvent(
  eventName: string,
  updates: {
    eventName?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    description?: string;
    participantsLimit?: number;
  }
) {
  const response = await fetch(`${API_BASE_URL}/events/${eventName}`, {
    method: 'PUT',
    ...fetchOptions,
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update event');
  }
  return response.json();
}

export async function deleteEvent(eventName: string) {
  const response = await fetch(`${API_BASE_URL}/events/${eventName}`, {
    method: 'DELETE',
    ...fetchOptions,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete event');
  }
  return response.json();
}
