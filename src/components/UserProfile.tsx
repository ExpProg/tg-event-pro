import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TelegramUser } from '@/types/telegram';
import { User } from 'lucide-react';

interface UserProfileProps {
  user: TelegramUser | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  size = 'md', 
  showName = true,
  className = '' 
}) => {
  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className={size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'}>
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        {showName && (
          <span className="text-sm text-muted-foreground">Гость</span>
        )}
      </div>
    );
  }

  const getInitials = (firstName: string, lastName?: string) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const getDisplayName = () => {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return fullName || user.username || 'Пользователь';
  };

  const avatarSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className={avatarSizeClass[size]}>
        {user.photo_url && (
          <AvatarImage 
            src={user.photo_url} 
            alt={getDisplayName()}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(user.first_name, user.last_name)}
        </AvatarFallback>
      </Avatar>
      
      {showName && (
        <div className="flex flex-col">
          <span className={`font-medium text-foreground ${textSizeClass[size]}`}>
            {getDisplayName()}
          </span>
          {user.username && (
            <span className="text-xs text-muted-foreground">
              @{user.username}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 