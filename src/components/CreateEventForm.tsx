import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, EventCategory } from '@/types/event';
import { eventService } from '@/services/eventService';
import { useTelegram } from '@/hooks/useTelegram';
import { Calendar, MapPin, Users, DollarSign, Image, Plus } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory | '';
  maxParticipants: string;
  price: string;
  image: string;
  organizer: string;
  contactInfo: string;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useTelegram();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxParticipants: '',
    price: '',
    image: '',
    organizer: user ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    contactInfo: user ? '' : '', // Для неавторизованных пользователей может понадобиться контактная информация
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const categoryOptions: { value: EventCategory; label: string }[] = [
    { value: 'conference', label: 'Конференция' },
    { value: 'workshop', label: 'Мастер-класс' },
    { value: 'meetup', label: 'Митап' },
    { value: 'webinar', label: 'Вебинар' },
    { value: 'networking', label: 'Нетворкинг' },
    { value: 'training', label: 'Тренинг' },
    { value: 'other', label: 'Другое' },
  ];

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

    if (!formData.location.trim()) {
      newErrors.location = 'Место проведения обязательно';
    }

    if (!formData.category) {
      newErrors.category = 'Категория обязательна';
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Организатор обязателен';
    }

    // Для неавторизованных пользователей обязательна контактная информация
    if (!user && !formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Контактная информация обязательна для неавторизованных пользователей';
    }

    // Проверка даты на будущее время
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime <= new Date()) {
        newErrors.date = 'Дата должна быть в будущем';
      }
    }

    // Проверка максимального количества участников
    if (formData.maxParticipants && isNaN(Number(formData.maxParticipants))) {
      newErrors.maxParticipants = 'Введите число';
    }

    // Проверка цены
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Введите число';
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
        location: formData.location.trim(),
        category: formData.category as EventCategory,
        organizer: formData.organizer.trim(),
        creatorId: user?.id, // undefined для неавторизованных пользователей
        contactInfo: formData.contactInfo.trim() || undefined, // Контактная информация
        currentParticipants: 0,
        isActive: true,
        maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
        price: formData.price ? Number(formData.price) : undefined,
        image: formData.image.trim() || undefined,
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

          {/* Место проведения */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Место проведения *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Адрес или онлайн-ссылка"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          {/* Категория */}
          <div className="space-y-2">
            <Label htmlFor="category">Категория *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Организатор */}
          <div className="space-y-2">
            <Label htmlFor="organizer">Организатор *</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
              placeholder="Имя организатора или организации"
              className={errors.organizer ? 'border-red-500' : ''}
            />
            {errors.organizer && <p className="text-sm text-red-500">{errors.organizer}</p>}
          </div>

          {/* Дополнительные поля */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Макс. участников
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                placeholder="Без ограничений"
                className={errors.maxParticipants ? 'border-red-500' : ''}
              />
              {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Цена (₽)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Бесплатно"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>

          {/* Изображение */}
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              Изображение (URL)
            </Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
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