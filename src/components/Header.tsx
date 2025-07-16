import React from 'react';
import Logo from './Logo';
import UserProfile from './UserProfile';
import { useTelegram } from '@/hooks/useTelegram';

interface HeaderProps {
  className?: string;
  onCreateEvent?: () => void;
}

const Header: React.FC<HeaderProps> = ({ className = '', onCreateEvent }) => {
  const { user } = useTelegram();

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Логотип слева */}
        <div className="flex items-center">
          <Logo size="md" showText={true} />
        </div>

        {/* Профиль пользователя справа */}
        <div className="flex items-center">
          <UserProfile 
            user={user} 
            size="md" 
            onCreateEvent={onCreateEvent}
            className="cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 