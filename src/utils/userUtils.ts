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
 * Получает данные пользователя по Telegram ID
 * В реальном приложении это должно быть обращение к Telegram API
 */
export const getUserById = async (userId: number): Promise<TelegramUser | null> => {
  try {
    // В реальном приложении здесь должен быть запрос к Telegram Bot API
    // Пока что возвращаем mock данные или данные из WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id === userId) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    
    // Fallback: возвращаем базовую информацию
    return {
      id: userId,
      first_name: 'Пользователь',
      last_name: undefined,
      username: undefined
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
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