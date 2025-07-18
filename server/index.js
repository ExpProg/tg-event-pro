// server/index.js
// Основной серверный файл для API

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usersRouter = require('./api/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api/users', usersRouter);

// Для продакшена: обслуживание статических файлов React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
    console.log('Для получения данных пользователей нужно:');
    console.log('1. Создать бот через @BotFather');
    console.log('2. Установить токен в .env файл: TELEGRAM_BOT_TOKEN=your_token_here');
  }
}); 