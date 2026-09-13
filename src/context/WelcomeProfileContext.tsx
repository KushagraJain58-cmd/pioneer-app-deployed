import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Mirrors the client's localStorage "studentWelcomeProfile" (saveWelcomeProfile / readWelcomeProfile).
export interface WelcomeProfile {
  grade: string;
  interests: string[];
  completedAt?: string;
}

const STORAGE_KEY = 'studentWelcomeProfile';

interface WelcomeProfileContextType {
  profile: WelcomeProfile | null;
  isLoading: boolean;
  hasCompletedWelcome: boolean;
  saveProfile: (profile: WelcomeProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const WelcomeProfileContext = createContext<WelcomeProfileContextType>(
  {} as WelcomeProfileContextType
);

export const WelcomeProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<WelcomeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  const saveProfile = useCallback(async (next: WelcomeProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
  }, []);

  const resetProfile = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return (
    <WelcomeProfileContext.Provider
      value={{
        profile,
        isLoading,
        hasCompletedWelcome: Boolean(profile?.grade),
        saveProfile,
        resetProfile,
      }}
    >
      {children}
    </WelcomeProfileContext.Provider>
  );
};

export const useWelcomeProfile = () => useContext(WelcomeProfileContext);
