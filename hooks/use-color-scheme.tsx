import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'light' | 'dark' | 'system';

type ContextType = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const THEME_KEY = 'themePreference';

const ThemePreferenceContext = createContext<ContextType | undefined>(undefined);

export const ThemePreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    // load persisted preference
    (async () => {
      try {
        const value = await SecureStore.getItemAsync(THEME_KEY);
        if (value === 'light' || value === 'dark' || value === 'system') {
          setPreferenceState(value as ThemePreference);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    SecureStore.setItemAsync(THEME_KEY, p).catch(() => {});
  };

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
};

/**
 * Returns the current effective color scheme: 'light' or 'dark'.
 * If you need the raw preference (including 'system'), use `useThemePreference()`.
 */
export function useColorScheme() {
  const ctx = useContext(ThemePreferenceContext);
  const rn = useRNColorScheme();

  if (!ctx) {
    // No provider — fall back to OS preference
    return rn ?? 'light';
  }

  if (ctx.preference === 'system') return rn ?? 'light';
  return ctx.preference;
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used inside ThemePreferenceProvider');
  }
  return ctx;
}
