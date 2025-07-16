import { useState } from 'react';
import Header from './components/Header';
import EventList from './components/EventList';
import { useTelegram } from './hooks/useTelegram';

type Page = 'events' | 'create-event';

function App() {
  const { isReady } = useTelegram();
  const [currentPage, setCurrentPage] = useState<Page>('events');

  const handleCreateEvent = () => {
    setCurrentPage('create-event');
  };

  const handleBackToEvents = () => {
    setCurrentPage('events');
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

  const renderContent = () => {
    switch (currentPage) {
      case 'create-event':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <button
                onClick={handleBackToEvents}
                className="text-primary hover:underline mb-4"
              >
                ← Назад к мероприятиям
              </button>
              <h1 className="text-2xl font-bold">Создать мероприятие</h1>
            </div>
            <div className="max-w-2xl">
              <p className="text-muted-foreground">Форма создания мероприятия будет здесь</p>
            </div>
          </div>
        );
      case 'events':
      default:
        return <EventList />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateEvent={handleCreateEvent} />
      {renderContent()}
    </div>
  );
}

export default App; 