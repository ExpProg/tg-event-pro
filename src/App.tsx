import { useState } from 'react';
import Header from './components/Header';
import EventList from './components/EventList';
import CreateEventForm from './components/CreateEventForm';
import AdminPanel from './components/AdminPanel';
import { useTelegram } from './hooks/useTelegram';

type Page = 'events' | 'create-event' | 'admin';

function App() {
  const { isReady } = useTelegram();
  const [currentPage, setCurrentPage] = useState<Page>('events');
  const [eventListKey, setEventListKey] = useState(0); // Ключ для принудительного обновления списка

  const handleCreateEvent = () => {
    setCurrentPage('create-event');
  };

  const handleBackToEvents = () => {
    setCurrentPage('events');
  };

  const handleAdminPanel = () => {
    setCurrentPage('admin');
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Инициализация приложения...</p>
        </div>
      </div>
    );
  }

  const handleEventCreated = (eventId: string) => {
    console.log('Мероприятие создано с ID:', eventId);
    // Увеличиваем ключ для принудительного обновления списка мероприятий
    setEventListKey(prev => prev + 1);
    // Возвращаемся к списку мероприятий после успешного создания
    setCurrentPage('events');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'create-event':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <button
                onClick={handleBackToEvents}
                className="text-primary hover:underline mb-4 inline-flex items-center"
              >
                ← Назад к мероприятиям
              </button>
            </div>
            <div className="flex justify-center">
              <CreateEventForm 
                onSuccess={handleEventCreated}
                onCancel={handleBackToEvents}
              />
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <button
                onClick={handleBackToEvents}
                className="text-primary hover:underline mb-4 inline-flex items-center"
              >
                ← Назад к мероприятиям
              </button>
              <h1 className="text-2xl font-bold">Панель администратора</h1>
              <p className="text-muted-foreground mt-1">
                Управление пользователями и ролями системы
              </p>
            </div>
            <AdminPanel />
          </div>
        );
      case 'events':
      default:
        return <EventList key={eventListKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCreateEvent={handleCreateEvent} 
        onAdminPanel={handleAdminPanel}
      />
      {renderContent()}
    </div>
  );
}

export default App; 