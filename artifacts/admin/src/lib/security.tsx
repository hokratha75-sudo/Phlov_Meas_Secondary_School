import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';

interface SecurityContextType {
  sessionExpiryWarning: number | null;
  clearWarning: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState<number | null>(null);

  // Check session expiry (decode JWT)
  useEffect(() => {
    if (!token) {
      setSessionExpiryWarning(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      const timeLeft = expiryTime - now;

      // Show warning 5 minutes before expiry
      if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
        setSessionExpiryWarning(Math.floor(timeLeft / 1000));
      } else {
        setSessionExpiryWarning(null);
      }
    } catch (e) {
      console.error('Failed to decode token', e);
      setSessionExpiryWarning(null);
    }
  }, [token]);

  const clearWarning = () => setSessionExpiryWarning(null);

  return (
    <SecurityContext.Provider value={{ sessionExpiryWarning, clearWarning }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
}
