// server/api/users.js
// Серверный API для получения данных пользователей Telegram

const express = require('express');
const router = express.Router();

// В реальном приложении это должно быть в переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Получает данные пользователя по ID через Telegram Bot API
 */
async function getTelegramUser(userId) {
  try {
    // В Telegram Bot API нет прямого метода для получения данных пользователя по ID
    // Можно использовать только данные из взаимодействий с ботом
    
    // Альтернативный подход: сохранять данные пользователей при первом взаимодействии
    // и получать их из базы данных
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: userId
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        return {
          id: data.result.id,
          first_name: data.result.first_name,
          last_name: data.result.last_name,
          username: data.result.username
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user from Telegram API:', error);
    return null;
  }
}

/**
 * GET /api/users/:userId
 * Получает данные пользователя по ID
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Проверяем авторизацию (в реальном приложении нужна валидация Telegram WebApp данных)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    // Получаем данные пользователя
    const userData = await getTelegramUser(userId);
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData);
  } catch (error) {
    console.error('Error in /api/users/:userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 