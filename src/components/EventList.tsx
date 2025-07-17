import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { Event } from '@/types/event';
import { eventService } from '@/services/eventService';
import { useTelegram } from '@/hooks/useTelegram';

interface EventListProps {
  onViewEventDetails?: (eventId: string) => void;
}

// Демо данные для событий
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'React Conference 2024',
    description: 'Ежегодная конференция по React разработке. Узнайте о последних трендах и технологиях в мире React.',
    date: new Date('2024-03-15T10:00:00'),
    location: 'ТехноПарк, Москва',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    maxParticipants: 100,
    currentParticipants: 45,
    price: 2500,
    organizer: 'React Moscow',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'TypeScript Workshop',
    description: 'Интенсивный мастер-класс по TypeScript для продвинутых разработчиков. Изучите продвинутые типы и паттерны.',
    date: new Date('2024-03-20T14:00:00'),
    location: 'Online',
    maxParticipants: 50,
    currentParticipants: 12,
    price: 1500,
    organizer: 'TypeScript Community',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'JavaScript Meetup',
    description: 'Ежемесячный митап для JavaScript разработчиков. Обсуждаем новости, делимся опытом и общаемся.',
    date: new Date('2024-03-25T19:00:00'),
    location: 'Коворкинг Spaces, СПб',
    maxParticipants: 80,
    currentParticipants: 25,
    organizer: 'JS Community SPb',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Вебинар: Карьера в IT',
    description: 'Как построить успешную карьеру в IT. Советы от ведущих специалистов индустрии.',
    date: new Date('2024-03-28T20:00:00'),
    location: 'Zoom',
    maxParticipants: 200,
    currentParticipants: 89,
    organizer: 'IT Career Center',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Нетворкинг: Стартапы и инвестиции',
    description: 'Встреча предпринимателей и инвесторов. Возможность представить свой проект и найти партнеров.',
    date: new Date('2024-04-02T18:00:00'),
    location: 'Business Center, Москва',
    maxParticipants: 60,
    currentParticipants: 35,
    price: 3000,
    organizer: 'Startup Hub',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const EventList: React.FC<EventListProps> = ({ onViewEventDetails }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const { user, isReady } = useTelegram();

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Пытаемся загрузить события из Firebase
        const firebaseEvents = await eventService.getEvents();
        
        if (firebaseEvents.length > 0) {
          setEvents(firebaseEvents);
        } else {
          // Если в Firebase нет событий, используем демо данные
          setEvents(demoEvents);
        }
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
        // В случае ошибки также используем демо данные
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    };

    if (isReady) {
      loadEvents();
    }
  }, [isReady]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      console.log('Пользователь не авторизован');
      return;
    }

    try {
      const success = await eventService.registerForEvent(eventId, user.id);
      if (success) {
        setRegisteredEvents(prev => new Set([...prev, eventId]));
        // Обновляем локальный список событий
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, currentParticipants: event.currentParticipants + 1 }
              : event
          )
        );
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
    }
  };

  const handleViewDetails = (eventId: string) => {
    if (onViewEventDetails) {
      onViewEventDetails(eventId);
    } else {
      console.log('Просмотр деталей события:', eventId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загружаем события...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">События не найдены</p>
          <p className="text-sm text-muted-foreground mt-2">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">Мероприятия</h1>
        <p className="text-muted-foreground text-center">
          Найдите интересные события и мероприятия
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={registeredEvents.has(event.id)}
            onRegister={handleRegister}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </main>
  );
};

export default EventList; 