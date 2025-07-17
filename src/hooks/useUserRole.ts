import { useMemo } from 'react';
import { TelegramUser, UserRole } from '@/types/telegram';

// Список ID администраторов (можно вынести в переменные окружения)
const ADMIN_IDS: number[] = [
  // Добавьте сюда ID администраторов
  // Например: 123456789, 987654321
];

export const useUserRole = (user: TelegramUser | null) => {
  const role = useMemo((): UserRole => {
    if (!user) return 'user';
    
    // Если роль явно указана в объекте пользователя
    if (user.role) {
      return user.role;
    }
    
    // Проверяем по ID пользователя
    if (ADMIN_IDS.includes(user.id)) {
      return 'admin';
    }
    
    // По умолчанию - обычный пользователь
    return 'user';
  }, [user]);

  const isAdmin = useMemo(() => role === 'admin', [role]);
  const isUser = useMemo(() => role === 'user', [role]);

  return {
    role,
    isAdmin,
    isUser,
  };
};

// Утилитные функции для проверки ролей
export const isUserAdmin = (user: TelegramUser | null): boolean => {
  if (!user) return false;
  
  if (user.role) {
    return user.role === 'admin';
  }
  
  return ADMIN_IDS.includes(user.id);
};

export const getUserRole = (user: TelegramUser | null): UserRole => {
  if (!user) return 'user';
  
  if (user.role) {
    return user.role;
  }
  
  return ADMIN_IDS.includes(user.id) ? 'admin' : 'user';
}; 