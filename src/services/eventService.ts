import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, EventParticipant } from '@/types/event';

const EVENTS_COLLECTION = 'events';
const PARTICIPANTS_COLLECTION = 'participants';

// Конвертер для событий
const eventConverter = {
  toFirestore: (event: Event) => ({
    ...event,
    date: Timestamp.fromDate(event.date),
    createdAt: Timestamp.fromDate(event.createdAt),
    updatedAt: Timestamp.fromDate(event.updatedAt),
  }),
  fromFirestore: (snapshot: any) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Event;
  }
};

export const eventService = {
  // Получить все активные события
  async getEvents(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(
        eventsRef,
        where('isActive', '==', true),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => eventConverter.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  },

  // Получить событие по ID
  async getEventById(id: string): Promise<Event | null> {
    try {
      const eventDoc = doc(db, EVENTS_COLLECTION, id);
      const snapshot = await getDoc(eventDoc);
      
      if (snapshot.exists()) {
        return eventConverter.fromFirestore(snapshot);
      }
      return null;
    } catch (error) {
      console.error('Error getting event:', error);
      return null;
    }
  },

  // Создать новое событие
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = new Date();
      const event: Omit<Event, 'id'> = {
        ...eventData,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventConverter.toFirestore(event as Event));
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  },

  // Регистрация на событие
  async registerForEvent(eventId: string, userId: number): Promise<boolean> {
    try {
      const participant: Omit<EventParticipant, 'id'> = {
        eventId,
        userId,
        joinedAt: new Date(),
        status: 'confirmed',
      };
      
      await addDoc(collection(db, PARTICIPANTS_COLLECTION), {
        ...participant,
        joinedAt: Timestamp.fromDate(participant.joinedAt),
      });
      
      // Увеличиваем счетчик участников
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const currentEvent = eventConverter.fromFirestore(eventSnap);
        await updateDoc(eventRef, {
          currentParticipants: currentEvent.currentParticipants + 1,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error registering for event:', error);
      return false;
    }
  },

  // Проверить регистрацию пользователя на событие
  async isUserRegistered(eventId: string, userId: number): Promise<boolean> {
    try {
      const participantsRef = collection(db, PARTICIPANTS_COLLECTION);
      const q = query(
        participantsRef,
        where('eventId', '==', eventId),
        where('userId', '==', userId),
        where('status', '==', 'confirmed')
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  },
}; 