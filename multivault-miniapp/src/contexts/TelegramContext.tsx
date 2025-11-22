import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  hapticFeedback: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  hapticNotification: (type: 'error' | 'success' | 'warning') => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  ready: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      WebApp.ready();
      setReady(true);
      
      // Get user data from Telegram
      const initData = WebApp.initDataUnsafe;
      if (initData?.user) {
        setUser(initData.user as TelegramUser);
      }
    } catch (error) {
      console.warn('Telegram WebApp not available:', error);
      // Fallback for development
      setReady(true);
      setUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
      });
    }
  }, []);

  const hapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    try {
      WebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  const hapticNotification = (type: 'error' | 'success' | 'warning') => {
    try {
      if (type === 'success') {
        WebApp.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        WebApp.HapticFeedback.notificationOccurred('warning');
      }
    } catch (error) {
      console.warn('Haptic notification not available:', error);
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    try {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    } catch (error) {
      console.warn('Main button not available:', error);
    }
  };

  const hideMainButton = () => {
    try {
      WebApp.MainButton.hide();
    } catch (error) {
      console.warn('Main button not available:', error);
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        user,
        hapticFeedback,
        hapticNotification,
        showMainButton,
        hideMainButton,
        ready,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};

