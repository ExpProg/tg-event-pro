import { useMemo, useEffect, useState } from 'react';
import { TelegramUser, UserRole } from '@/types/telegram';
import { userService } from '@/services/userService';

// Список ID администраторов (можно вынести в переменные окружения)
const ADMIN_IDS: number[] = [
  // Добавьте сюда ID администраторов
  // Например для Artem Mornev - замените на реальный ID из консоли:
  // 123456789, // Artem Mornev - замените на реальный ID
];

export const useUserRole = (user: TelegramUser | null) => {
  const [firestoreRole, setFirestoreRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  // Получаем роль из Firestore при изменении пользователя
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // Создаем или обновляем пользователя в Firestore
      userService.createOrUpdateUser(user)
        .then((firestoreUser) => {
          if (firestoreUser) {
            setFirestoreRole(firestoreUser.role);
          } else {
            // Если не удалось получить из Firestore, используем локальную логику
            setFirestoreRole(getLocalRole(user));
          }
        })
        .catch((error) => {
          console.error('Error updating user in Firestore:', error);
          // В случае ошибки используем локальную логику
          setFirestoreRole(getLocalRole(user));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFirestoreRole(null);
      setLoading(false);
    }
  }, [user]);

  // Локальная логика определения роли (резерв)
  const getLocalRole = (user: TelegramUser): UserRole => {
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
  };

  const role = useMemo((): UserRole => {
    if (!user) return 'user';
    
    // Приоритет: роль из Firestore > локальная логика
    return firestoreRole || getLocalRole(user);
  }, [user, firestoreRole]);

  const isAdmin = useMemo(() => role === 'admin', [role]);
  const isUser = useMemo(() => role === 'user', [role]);

  return {
    role,
    isAdmin,
    isUser,
    loading,
  };
};

// Утилитные функции для проверки ролей (используют локальную логику)
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

// Асинхронные функции для работы с Firestore
export const getUserRoleFromFirestore = async (telegramId: number): Promise<UserRole> => {
  try {
    const user = await userService.getUserByTelegramId(telegramId);
    return user?.role || 'user';
  } catch (error) {
    console.error('Error getting role from Firestore:', error);
    return 'user';
  }
};

export const isUserAdminFromFirestore = async (telegramId: number): Promise<boolean> => {
  const role = await getUserRoleFromFirestore(telegramId);
  return role === 'admin';
}; 