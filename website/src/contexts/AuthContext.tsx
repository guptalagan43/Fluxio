// src/contexts/AuthContext.tsx
// Auth context — stub for Phase 1 (always user = null).
// Full implementation in Phase 7: GET /auth/me on mount to restore session.

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/domain';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState<boolean>(false);

  const login = (newUser: User): void => {
    setUser(newUser);
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
