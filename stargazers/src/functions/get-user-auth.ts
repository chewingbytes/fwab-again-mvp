import { getCurrentUser } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string;
}

export default async function getUser(): Promise<AuthUser | null> {
  try {
    const response = await getCurrentUser();
    return response.user || null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}