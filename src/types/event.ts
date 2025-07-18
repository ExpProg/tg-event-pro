export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image?: string;
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  organizerId: number; // Telegram user ID организатора (обязательное поле)
  contactInfo?: string; // Контактная информация для неавторизованных создателей
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  eventId: string;
  userId: number; // Telegram user ID
  joinedAt: Date;
  status: 'confirmed' | 'waitlist' | 'cancelled';
} 