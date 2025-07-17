import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';
import { eventService } from '@/services/eventService';
import { useTelegram } from '@/hooks/useTelegram';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  Heart,
  DollarSign,
  Building,
  Mail
} from 'lucide-react';

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onBack }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useTelegram();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      conference: 'Конференция',
      workshop: 'Мастер-класс',
      meetup: 'Митап',
      webinar: 'Вебинар',
      networking: 'Нетворкинг',
      training: 'Тренинг',
      other: 'Другое',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleRegister = async () => {
    if (!event) return;
    
    try {
      console.log('Регистрация на мероприятие:', event.id);
      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - копируем в буфер обмена
      await navigator.clipboard.writeText(
        `${event.title}\n${event.description}\n${window.location.href}`
      );
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Загрузка мероприятия...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Мероприятие не найдено</h2>
          <p className="text-muted-foreground mb-6">
            Мероприятие с таким ID не существует или было удалено.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  const isEventFull = event.maxParticipants ? event.currentParticipants >= event.maxParticipants : false;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Навигация */}
      <div className="mb-3">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к мероприятиям
        </Button>
      </div>

      {/* Главная карточка мероприятия */}
      <Card className="mb-6">
        {event.image && (
          <div className="w-full h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {getCategoryLabel(event.category)}
                </Badge>
                {event.price && (
                  <Badge variant="outline" className="text-primary">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {event.price.toLocaleString('ru-RU')} ₽
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{formatDate(event.date)}</div>
                  <div className="text-sm">{formatTime(event.date)}</div>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{event.location}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">
                    {event.currentParticipants}
                    {event.maxParticipants && ` / ${event.maxParticipants}`} участников
                  </div>
                  {isEventFull && (
                    <div className="text-sm text-destructive">Мест нет</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Building className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{event.organizer}</div>
                  <div className="text-sm">Организатор</div>
                </div>
              </div>
            </div>
          </div>

          {/* Описание */}
          <div>
            <h3 className="text-lg font-semibold mb-3">О мероприятии</h3>
            <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
              {event.description}
            </CardDescription>
          </div>

          {/* Контактная информация организатора (если не авторизован) */}
          {event.contactInfo && !user && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Контакты организатора</h3>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start text-sm">
                  <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="whitespace-pre-wrap">{event.contactInfo}</div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          {!isEventPast && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleRegister}
                disabled={isRegistered || isEventFull}
                className="flex-1"
                size="lg"
                variant={isRegistered ? "secondary" : "default"}
              >
                {isRegistered 
                  ? "✓ Вы записаны" 
                  : isEventFull 
                    ? "Мест нет" 
                    : "Записаться на мероприятие"
                }
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          )}

          {isEventPast && (
            <div className="text-center py-4 text-muted-foreground border-t">
              Это мероприятие уже прошло
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetails; 