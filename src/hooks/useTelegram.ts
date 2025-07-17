import { useEffect, useState } from 'react';
import { TelegramUser } from '@/types/telegram';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      setIsReady(true);
      
      // Получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        const userData = tg.initDataUnsafe.user;
        setUser(userData);
        // Временно выводим ID в консоль для назначения админа
        console.log('User ID:', userData.id, 'Name:', userData.first_name, userData.last_name);
      }

      // Расширяем приложение на весь экран
      tg.expand();
      
      // Применяем тему из Telegram
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Настраиваем цвета темы
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color);
      }
    }
  }, []);

  const showMainButton = (text: string, callback: () => void) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.onClick(callback);
    }
  };

  const hideMainButton = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.hide();
    }
  };

  const close = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  };

  return {
    isReady,
    user,
    tg: window.Telegram?.WebApp,
    showMainButton,
    hideMainButton,
    close,
  };
}; 