import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  onRegister?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isRegistered = false, 
  onRegister, 
  onViewDetails 
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const isEventFull = event.maxParticipants ? event.currentParticipants >= event.maxParticipants : false;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <Card className="w-full max-w-md mx-auto hover:shadow-lg transition-shadow duration-300">
      {event.image && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {event.title}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1 px-2 py-1 bg-secondary rounded-full inline-block">
              {getCategoryLabel(event.category)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="text-sm line-clamp-3">
          {event.description}
        </CardDescription>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatDate(event.date)} в {formatTime(event.date)}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {event.currentParticipants}
              {event.maxParticipants && ` / ${event.maxParticipants}`} участников
            </span>
          </div>
        </div>

        {event.price && (
          <div className="text-lg font-semibold text-primary">
            {event.price.toLocaleString('ru-RU')} ₽
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails?.(event.id)}
            className="flex-1"
          >
            Подробнее
          </Button>
          
          {!isEventPast && (
            <Button
              size="sm"
              onClick={() => onRegister?.(event.id)}
              disabled={isRegistered || isEventFull}
              className="flex-1"
              variant={isRegistered ? "secondary" : "default"}
            >
              {isRegistered 
                ? "Записан" 
                : isEventFull 
                  ? "Мест нет" 
                  : "Записаться"
              }
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard; 