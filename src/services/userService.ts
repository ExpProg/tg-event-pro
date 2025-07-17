import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirestoreUser, CreateUserData, UpdateUserData } from '@/types/user';
import { TelegramUser, UserRole } from '@/types/telegram';

const USERS_COLLECTION = 'users';

// Конвертер для пользователей
const userConverter = {
  toFirestore: (user: FirestoreUser) => ({
    ...user,
    createdAt: user.createdAt instanceof Date ? Timestamp.fromDate(user.createdAt) : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? Timestamp.fromDate(user.updatedAt) : user.updatedAt,
    lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? Timestamp.fromDate(user.lastLoginAt) : user.lastLoginAt) : null,
  }),
  fromFirestore: (snapshot: any) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || null,
    } as FirestoreUser;
  }
};

export const userService = {
  // Получить пользователя по Telegram ID
  async getUserByTelegramId(telegramId: number): Promise<FirestoreUser | null> {
    try {
      const userDoc = doc(db, USERS_COLLECTION, telegramId.toString());
      const snapshot = await getDoc(userDoc);
      
      if (snapshot.exists()) {
        return userConverter.fromFirestore(snapshot);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Создать или обновить пользователя
  async createOrUpdateUser(telegramUser: TelegramUser): Promise<FirestoreUser | null> {
    try {
      const userId = telegramUser.id.toString();
      const userDoc = doc(db, USERS_COLLECTION, userId);
      
      // Проверяем существующего пользователя
      const existingUser = await this.getUserByTelegramId(telegramUser.id);
      
      const now = new Date();
      
      if (existingUser) {
        // Обновляем существующего пользователя
        const updateData: UpdateUserData = {
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          updatedAt: now,
          lastLoginAt: now,
        };
        
        // Убираем undefined значения
        const cleanData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );
        
        await updateDoc(userDoc, cleanData);
        
        return { 
          ...existingUser, 
          ...cleanData,
          updatedAt: now
        } as FirestoreUser;
      } else {
        // Создаем нового пользователя
        const userData: CreateUserData = {
          telegramId: telegramUser.id,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          role: telegramUser.role || 'user', // По умолчанию роль user
          isActive: true,
          lastLoginAt: now,
        };
        
        const newUser: FirestoreUser = {
          id: userId,
          ...userData,
          createdAt: now,
          updatedAt: now,
        };
        
        await setDoc(userDoc, userConverter.toFirestore(newUser));
        return newUser;
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return null;
    }
  },

  // Обновить роль пользователя
  async updateUserRole(telegramId: number, role: UserRole): Promise<boolean> {
    try {
      const userId = telegramId.toString();
      const userDoc = doc(db, USERS_COLLECTION, userId);
      
      await updateDoc(userDoc, {
        role: role,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  },

  // Получить всех пользователей (для админ панели)
  async getAllUsers(): Promise<FirestoreUser[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => userConverter.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  // Получить всех администраторов
  async getAdminUsers(): Promise<FirestoreUser[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(
        usersRef,
        where('role', '==', 'admin'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => userConverter.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  },

  // Миграция: добавить роли к существующим пользователям из событий
  async migrateUsersFromEvents(): Promise<{ success: number; errors: number }> {
    try {
      // Получаем все события для извлечения создателей
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      
      const batch = writeBatch(db);
      let success = 0;
      let errors = 0;
      
      const processedUsers = new Set<number>();
      
      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        
        if (eventData.creatorId && !processedUsers.has(eventData.creatorId)) {
          processedUsers.add(eventData.creatorId);
          
          try {
            const userId = eventData.creatorId.toString();
            const userDoc = doc(db, USERS_COLLECTION, userId);
            
            // Проверяем, существует ли пользователь
            const existingUser = await getDoc(userDoc);
            
            if (!existingUser.exists()) {
              // Создаем пользователя с базовой информацией
              const now = new Date();
              const userData: FirestoreUser = {
                id: userId,
                telegramId: eventData.creatorId,
                firstName: eventData.organizer || 'Неизвестный пользователь',
                role: 'user', // По умолчанию обычный пользователь
                isActive: true,
                createdAt: now,
                updatedAt: now,
              };
              
              batch.set(userDoc, userConverter.toFirestore(userData));
              success++;
            }
          } catch (error) {
            console.error(`Error processing user ${eventData.creatorId}:`, error);
            errors++;
          }
        }
      }
      
      if (success > 0) {
        await batch.commit();
      }
      
      return { success, errors };
    } catch (error) {
      console.error('Error during migration:', error);
      return { success: 0, errors: 1 };
    }
  },

  // Назначить пользователя администратором по Telegram ID
  async promoteToAdmin(telegramId: number): Promise<boolean> {
    return this.updateUserRole(telegramId, 'admin');
  },

  // Убрать права администратора
  async demoteFromAdmin(telegramId: number): Promise<boolean> {
    return this.updateUserRole(telegramId, 'user');
  },
};

export default userService; 