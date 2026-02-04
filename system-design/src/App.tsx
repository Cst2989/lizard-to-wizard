import { useState } from 'react';
import { Slideshow } from './components/Slideshow';
import { ChatApp } from './features/chat';
import './App.css';

type View = 'slides' | 'chat';

function App() {
  const [view, setView] = useState<View>('slides');

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="app-nav">
        <button 
          className={view === 'slides' ? 'active' : ''} 
          onClick={() => setView('slides')}
        >
          Theory Slides
        </button>
        <button 
          className={view === 'chat' ? 'active' : ''} 
          onClick={() => setView('chat')}
        >
          Chat App Demo
        </button>
      </nav>

      {/* Content */}
      {view === 'slides' ? <Slideshow /> : <ChatApp />}
    </div>
  );
}

export default App;
