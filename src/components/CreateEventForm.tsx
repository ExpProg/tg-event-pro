import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Event } from '@/types/event';
import { eventService } from '@/services/eventService';
import { useTelegram } from '@/hooks/useTelegram';
import { Calendar, Plus } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  contactInfo: string;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useTelegram();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    contactInfo: user ? '' : '', // Для неавторизованных пользователей может понадобиться контактная информация
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.date) {
      newErrors.date = 'Дата обязательна';
    }

    if (!formData.time) {
      newErrors.time = 'Время обязательно';
    }

    // Для неавторизованных пользователей обязательна контактная информация
    if (!user && !formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Контактная информация обязательна для неавторизованных пользователей';
    }

    // Проверка даты на будущее время
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime <= new Date()) {
        newErrors.date = 'Дата и время должны быть в будущем';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Создаем объект события
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDateTime,
        location: '', // Пустое значение для места проведения
        organizer: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Организатор', // Автоматически из данных пользователя или значение по умолчанию
        creatorId: user?.id, // undefined для неавторизованных пользователей
        contactInfo: formData.contactInfo.trim() || undefined, // Контактная информация
        currentParticipants: 0,
        isActive: true,
      };

      const eventId = await eventService.createEvent(eventData);
      
      if (eventId) {
        alert('Мероприятие успешно создано!');
        onSuccess?.(eventId);
      } else {
        throw new Error('Не удалось создать мероприятие');
      }
    } catch (error) {
      console.error('Ошибка создания мероприятия:', error);
      alert('Произошла ошибка при создании мероприятия');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Создать мероприятие
        </CardTitle>
        <CardDescription>
          Заполните информацию о вашем мероприятии
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="title">Название мероприятия *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Введите название мероприятия"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Опишите ваше мероприятие"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Дата *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.time ? 'border-red-500' : ''}
              />
              {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* Контактная информация для неавторизованных пользователей */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Контактная информация *</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder="Email, телефон или Telegram для связи"
                className={errors.contactInfo ? 'border-red-500' : ''}
              />
              {errors.contactInfo && <p className="text-sm text-red-500">{errors.contactInfo}</p>}
              <p className="text-xs text-muted-foreground">
                Укажите, как с вами можно связаться по поводу мероприятия
              </p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать мероприятие'}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEventForm; 