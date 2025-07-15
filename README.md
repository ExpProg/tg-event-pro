# Telegram Event Pro

Telegram моно-приложение для просмотра и регистрации на мероприятия.

## Возможности

- 🎯 Просмотр списка мероприятий
- 📱 Интеграция с Telegram Web App
- 🔥 Firebase Firestore для хранения данных
- 🎨 Современный UI с shadcn/ui
- 📦 Готово для деплоя на Netlify

## Технологии

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Firebase Firestore
- **Deploy**: Netlify
- **Integration**: Telegram Web App SDK

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

## Конфигурация Firebase

Приложение уже настроено с вашими Firebase ключами:
- **Project ID**: eventfirebase-41c76
- **API Key**: AIzaSyD9SzT6ul696msbdviP5lVNP2Q_lNy2N1E

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Настройки сборки уже настроены в `netlify.toml`
3. Сайт будет доступен после деплоя

## Настройка Telegram Bot

1. Создайте бота через @BotFather
2. Получите токен бота
3. Настройте Web App URL на ваш Netlify домен
4. Добавьте команды в меню бота

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── ui/             # shadcn/ui компоненты
│   ├── EventCard.tsx   # Карточка события
│   └── EventList.tsx   # Список событий
├── hooks/              # React хуки
│   └── useTelegram.ts  # Хук для Telegram Web App
├── lib/                # Утилиты
│   ├── firebase.ts     # Конфигурация Firebase
│   └── utils.ts        # Общие утилиты
├── services/           # Сервисы
│   └── eventService.ts # Работа с событиями
├── types/              # TypeScript типы
│   ├── event.ts        # Типы событий
│   └── telegram.ts     # Типы Telegram
├── App.tsx             # Главный компонент
├── main.tsx            # Точка входа
└── index.css           # Стили
```

## Демо данные

Приложение включает демо данные с различными типами мероприятий:
- Конференции
- Мастер-классы  
- Митапы
- Вебинары
- Нетворкинг события

## Команды

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run preview` - Предпросмотр сборки
- `npm run lint` - Проверка кода

## Особенности

- ✅ Авторизация через Telegram
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Темная/светлая тема из Telegram
- ✅ Регистрация на события
- ✅ Отображение статуса регистрации
- ✅ Счетчик участников 