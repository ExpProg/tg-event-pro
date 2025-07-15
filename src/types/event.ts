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
  category: EventCategory;
  organizer: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 
  | 'conference'
  | 'workshop'
  | 'meetup'
  | 'webinar'
  | 'networking'
  | 'training'
  | 'other';

export interface EventParticipant {
  eventId: string;
  userId: number; // Telegram user ID
  joinedAt: Date;
  status: 'confirmed' | 'waitlist' | 'cancelled';
} 