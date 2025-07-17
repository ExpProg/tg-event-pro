import { UserRole } from './telegram';

// Интерфейс пользователя в Firestore
export interface FirestoreUser {
  id: string; // Document ID = Telegram user ID
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Данные для создания пользователя
export type CreateUserData = Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>;

// Данные для обновления пользователя
export type UpdateUserData = Partial<Omit<FirestoreUser, 'id' | 'telegramId' | 'createdAt'>>; 