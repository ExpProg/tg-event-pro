interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

/**
 * Форматирует имя пользователя как "Имя Ф."
 */
export const formatUserName = (user: TelegramUser): string => {
  const firstName = user.first_name;
  const lastNameInitial = user.last_name ? user.last_name.charAt(0) + '.' : '';
  
  return lastNameInitial ? `${firstName} ${lastNameInitial}` : firstName;
};

/**
 * Получает данные пользователя по Telegram ID через серверный API
 */
export const getUserById = async (userId: number): Promise<TelegramUser | null> => {
  try {
    // Сначала проверяем, это ли текущий пользователь (доступно из WebApp)
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id === userId) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    
    // Для других пользователей делаем запрос к серверному API
    const response = await fetch(`/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // В реальном приложении здесь должен быть токен авторизации
        'Authorization': `Bearer ${window.Telegram?.WebApp?.initData || ''}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    
  } catch (error) {
    console.error('Error fetching user data from API:', error);
  }

  // Fallback: возвращаем базовую информацию
  return {
    id: userId,
    first_name: 'Организатор',
    last_name: undefined,
    username: undefined
  };
};

/**
 * Получает и форматирует имя пользователя по ID
 */
export const getFormattedUserName = async (userId: number): Promise<string> => {
  const user = await getUserById(userId);
  
  if (!user) {
    return 'Неизвестный организатор';
  }
  
  return formatUserName(user);
}; 