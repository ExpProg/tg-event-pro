import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { Calendar, User } from 'lucide-react';
import { getFormattedUserName } from '@/utils/userUtils';

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
  const [organizerName, setOrganizerName] = useState<string>('Загрузка...');

  useEffect(() => {
    const loadOrganizerName = async () => {
      const name = await getFormattedUserName(event.organizerId);
      setOrganizerName(name);
    };

    loadOrganizerName();
  }, [event.organizerId]);

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

  const isEventPast = new Date(event.date) < new Date();

  return (
    <Card className="w-full max-w-md mx-auto hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {event.title}
            </CardTitle>
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
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{organizerName}</span>
          </div>
        </div>
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
              disabled={isRegistered}
              className="flex-1"
              variant={isRegistered ? "secondary" : "default"}
            >
              {isRegistered 
                ? "Записан" 
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