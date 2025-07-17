import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { FirestoreUser } from '@/types/user';
import { userService } from '@/services/userService';
import { Users, Shield, UserX, ArrowLeft } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePromoteToAdmin = async (telegramId: number) => {
    setActionLoading(`promote-${telegramId}`);
    try {
      const success = await userService.promoteToAdmin(telegramId);
      if (success) {
        await loadUsers(); // Перезагружаем список
      }
    } catch (error) {
      console.error('Error promoting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemoteFromAdmin = async (telegramId: number) => {
    setActionLoading(`demote-${telegramId}`);
    try {
      const success = await userService.demoteFromAdmin(telegramId);
      if (success) {
        await loadUsers(); // Перезагружаем список
      }
    } catch (error) {
      console.error('Error demoting user:', error);
    } finally {
      setActionLoading(null);
    }
  };





  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const adminUsers = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role === 'user');

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Навигация */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к мероприятиям
        </Button>
      </div>

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Панель администратора</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Администраторы</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Обычные пользователи</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers.length}</div>
          </CardContent>
        </Card>
      </div>



      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Управление пользователями</CardTitle>
          <CardDescription>
            Список всех пользователей системы. Имена отображаются только для активных пользователей Telegram.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Загрузка пользователей...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Пользователи не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">ID: {user.telegramId}</span>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="destructive">Неактивен</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>Создан: {formatDate(user.createdAt)}</div>
                      {user.lastLoginAt && (
                        <div>Последний вход: {formatDate(user.lastLoginAt)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoteFromAdmin(user.telegramId)}
                        disabled={actionLoading === `demote-${user.telegramId}`}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Убрать админа
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteToAdmin(user.telegramId)}
                        disabled={actionLoading === `promote-${user.telegramId}`}
                      >
                        <Shield className="h-4 w-4 mr-2" />
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