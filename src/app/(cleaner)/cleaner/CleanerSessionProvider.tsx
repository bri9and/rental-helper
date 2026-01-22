'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CleanerSession {
  id: string;
  name: string;
  managerId: string;
}

interface CleanerSessionContextType {
  session: CleanerSession | null;
  isLoading: boolean;
  login: (cleanerId: string, name: string, managerId: string) => void;
  logout: () => void;
}

const CleanerSessionContext = createContext<CleanerSessionContextType | null>(null);

const STORAGE_KEY = 'cleaner_session';

export function CleanerSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CleanerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((cleanerId: string, name: string, managerId: string) => {
    const newSession = { id: cleanerId, name, managerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <CleanerSessionContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </CleanerSessionContext.Provider>
  );
}

export function useCleanerSession() {
  const context = useContext(CleanerSessionContext);
  if (!context) {
    throw new Error('useCleanerSession must be used within a CleanerSessionProvider');
  }
  return context;
}
