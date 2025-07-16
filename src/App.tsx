import Header from './components/Header';
import EventList from './components/EventList';
import { useTelegram } from './hooks/useTelegram';

function App() {
  const { isReady } = useTelegram();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventList />
    </div>
  );
}

export default App; 