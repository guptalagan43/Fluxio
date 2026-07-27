// src/popup/App.tsx
// Root popup component — Phase 2 MVP rendering Header and SessionPanel.

import { Header } from './components/Header';
import { SessionPanel } from './components/SessionPanel';
import { useActiveSession } from './hooks/useActiveSession';

function App(): JSX.Element {
  const { session, loading } = useActiveSession();

  if (loading) {
    return (
      <div className="popup-container">
        <Header />
        <div className="popup-body">
          <p className="popup-placeholder">Loading session...</p>
        </div>
      </div>
    );
  }

  const platformNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
  };

  const displayName = session ? (platformNames[session.platform] || session.platform) : 'AI Token Tracker';

  return (
    <div className="popup-container">
      <Header platformName={displayName} modelName={session?.model} />
      <SessionPanel session={session} />
    </div>
  );
}

export default App;
