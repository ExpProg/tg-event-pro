interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

// Mock база пользователей для демо данных
const mockUsers: Record<number, TelegramUser> = {
  123456789: {
    id: 123456789,
    first_name: 'Алексей',
    last_name: 'Морозов',
    username: 'alex_dev'
  },
  987654321: {
    id: 987654321,
    first_name: 'Мария',
    last_name: 'Петрова',
    username: 'maria_ts'
  },
  456789123: {
    id: 456789123,
    first_name: 'Дмитрий',
    last_name: 'Иванов',
    username: 'dmitry_js'
  },
  789123456: {
    id: 789123456,
    first_name: 'Елена',
    last_name: 'Кузнецова',
    username: 'elena_career'
  },
  321654987: {
    id: 321654987,
    first_name: 'Андрей',
    last_name: 'Волков',
    username: 'andrey_startup'
  }
};

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
    // Сначала проверяем, это ли текущий пользователь
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id === userId) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    
    // Проверяем mock базу пользователей для демо данных
    if (mockUsers[userId]) {
      return mockUsers[userId];
    }
    
    // В реальном приложении здесь был бы запрос к серверу или Telegram Bot API
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