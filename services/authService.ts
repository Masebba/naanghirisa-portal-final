import { User, UserRole } from '../types';
import { addUser, getUsers, updateUser as persistUser } from './mockData';

const AUTH_KEY = 'naanghirisa_session';

const stripPassword = (user: User): User => {
  const { password, ...rest } = user;
  return rest as User;
};

export const authService = {
  login: (identifier: string, password: string): User | null => {
    const cleanIdentifier = identifier.toLowerCase().trim();
    const user = getUsers().find(item => {
      const emailMatch = item.email.toLowerCase() === cleanIdentifier;
      const phoneMatch = item.phone
        ? item.phone.toLowerCase().replace(/\s+/g, '') === cleanIdentifier.replace(/\s+/g, '')
        : false;
      return emailMatch || phoneMatch;
    });

    if (!user || user.password !== password) return null;

    const session = stripPassword(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  registerUser: (user: User) => {
    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const exists = getUsers().some(item => {
      const sameEmail = item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase();
      const samePhone = item.phone && user.phone && item.phone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '');
      return sameEmail || samePhone;
    });

    if (exists) {
      throw new Error('A user with that email or phone number already exists.');
    }

    addUser(user);
    return stripPassword(user);
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  updateCurrentUser: (updatedUser: User) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    persistUser(updatedUser);
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(AUTH_KEY),

  hasAccess: (allowedRoles: UserRole[]): boolean => {
    const user = authService.getCurrentUser();
    return !!user && allowedRoles.includes(user.role);
  },
};
