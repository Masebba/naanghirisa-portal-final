
import { User, UserRole } from '../types';
import { getUsers, updateUser as updateMockUser } from './mockData';

const AUTH_KEY = 'naanghirisa_session';

export const authService = {
  login: (identifier: string, password: string): User | null => {
    const users = getUsers();
    const cleanIdentifier = identifier.toLowerCase().trim();
    
    // Find user by email OR phone
    const user = users.find(u => 
      u.email.toLowerCase() === cleanIdentifier || 
      (u.phone && u.phone.toLowerCase().replace(/\s+/g, '') === cleanIdentifier.replace(/\s+/g, ''))
    );
    
    // In this simulation, we verify against the password field
    // Default for new users is 'user123'
    if (user && user.password === password) {
      const { password: _, ...userSession } = user; // Don't store password in session
      localStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
      return userSession as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  updateCurrentUser: (updatedUser: User) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    updateMockUser(updatedUser);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_KEY);
  },

  hasAccess: (allowedRoles: UserRole[]): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }
};
