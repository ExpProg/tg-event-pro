import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/userService';
import { FirestoreUser } from '@/types/user';
import { UserRole } from '@/types/telegram';
import { Shield, Users, Database, UserPlus, UserMinus } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [newAdminId, setNewAdminId] = useState<string>('');

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Миграция пользователей из событий
  const handleMigration = async () => {
    setLoading(true);
    setMigrationStatus('Выполняется миграция...');
    
    try {
      const result = await userService.migrateUsersFromEvents();
      setMigrationStatus(
        `Миграция завершена! Создано пользователей: ${result.success}, ошибок: ${result.errors}`
      );
      
      // Перезагружаем список пользователей
      await loadUsers();
    } catch (error) {
      setMigrationStatus('Ошибка при выполнении миграции');
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Изменение роли пользователя
  const handleRoleChange = async (telegramId: number, newRole: UserRole) => {
    try {
      const success = await userService.updateUserRole(telegramId, newRole);
      if (success) {
        // Обновляем локальный список
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.telegramId === telegramId 
              ? { ...user, role: newRole }
              : user
          )
        );
      } else {
        alert('Ошибка при изменении роли');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Ошибка при изменении роли');
    }
  };

  // Назначить администратора по ID
  const handlePromoteToAdmin = async () => {
    if (!newAdminId.trim()) return;
    
    const telegramId = parseInt(newAdminId.trim());
    if (isNaN(telegramId)) {
      alert('Введите корректный Telegram ID (число)');
      return;
    }

    try {
      const success = await userService.promoteToAdmin(telegramId);
      if (success) {
        setNewAdminId('');
        await loadUsers();
        alert('Пользователь назначен администратором');
      } else {
        alert('Ошибка при назначении администратора');
      }
    } catch (error) {
      console.error('Error promoting to admin:', error);
      alert('Ошибка при назначении администратора');
    }
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Миграция пользователей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Миграция данных
          </CardTitle>
          <CardDescription>
            Создать записи пользователей в Firestore из существующих событий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleMigration} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Выполняется...' : 'Запустить миграцию'}
            </Button>
            
            {migrationStatus && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{migrationStatus}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Назначение администратора */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Назначить администратора
          </CardTitle>
          <CardDescription>
            Добавить права администратора пользователю по Telegram ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="adminId">Telegram ID</Label>
              <Input
                id="adminId"
                type="number"
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                placeholder="Введите Telegram ID пользователя"
              />
            </div>
            <Button 
              onClick={handlePromoteToAdmin}
              disabled={!newAdminId.trim() || loading}
              className="mt-6"
            >
              Назначить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление пользователями ({users.length})
          </CardTitle>
          <CardDescription>
            Список всех пользователей и управление их ролями
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Загрузка пользователей...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Пользователи не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">
                Запустите миграцию для создания записей пользователей
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.role === 'admin' && (
                        <Shield className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>ID: {user.telegramId}</p>
                      {user.username && <p>@{user.username}</p>}
                      <p>Создан: {formatDate(user.createdAt)}</p>
                      {user.lastLoginAt && (
                        <p>Последний вход: {formatDate(user.lastLoginAt)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                    
                    {user.role === 'admin' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.telegramId, 'user')}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Убрать админа
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleRoleChange(user.telegramId, 'admin')}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Сделать админом
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel; 