import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TelegramUser } from '@/types/telegram';
import { User, ChevronDown, Plus } from 'lucide-react';

interface UserProfileProps {
  user: TelegramUser | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCreateEvent?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  size = 'md',
  className = '',
  onCreateEvent
}) => {
  const getInitials = (firstName: string, lastName?: string) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const getDisplayName = () => {
    if (!user) return 'Гость';
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return fullName || user.username || 'Пользователь';
  };

  const avatarSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center space-x-1 rounded-full hover:opacity-80 transition-opacity ${className}`}>
          <Avatar className={avatarSizeClass[size]}>
            {user?.photo_url ? (
              <AvatarImage 
                src={user.photo_url} 
                alt={getDisplayName()}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user ? getInitials(user.first_name, user.last_name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">
            {getDisplayName()}
          </p>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {onCreateEvent && (
          <DropdownMenuItem onClick={onCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Создать мероприятие</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile; 