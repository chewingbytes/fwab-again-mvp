import usersData from '../../../stargazing.users.json';
import eventsData from '../../../stargazing.events.json';

export type User = typeof usersData[number];
export type Event = typeof eventsData[number];

let users: User[] = [...usersData];
let events: Event[] = [...eventsData];

export function getUsers(): User[] {
  return users;
}

export function addUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
  const newUser = {
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _id: { $oid: Math.random().toString(36).slice(2) },
  };

  console.log("Adding new user:", newUser);
  users.push(newUser);
  return newUser;
}

export function updateUser(email: string, updates: Partial<User>): User | null {
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  return users[idx];
}

export function deleteUser(email: string): boolean {
  const len = users.length;
  users = users.filter(u => u.email !== email);
  return users.length < len;
}

export function getEvents(): Event[] {
  return events;
}

export function addEvent(event: Omit<Event, '_id'>): Event {
  const newEvent = {
    ...event,
    _id: { $oid: Math.random().toString(36).slice(2) },
  };
  events.push(newEvent);
  return newEvent;
}

export function updateEvent(eventName: string, updates: Partial<Event>): Event | null {
  const idx = events.findIndex(e => e.eventName === eventName);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...updates };
  return events[idx];
}

export function deleteEvent(eventName: string): boolean {
  const len = events.length;
  events = events.filter(e => e.eventName !== eventName);
  return events.length < len;
}
