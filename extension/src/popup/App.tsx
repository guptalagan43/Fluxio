// src/popup/App.tsx
// Root popup component. Placeholder for Phase 1 — components added in later phases.

function App(): JSX.Element {
  return (
    <div className="popup-container">
      <div className="popup-header">
        <span className="popup-title">AI Token Tracker</span>
        <span className="popup-subtitle">Ready</span>
      </div>
      <div className="popup-body">
        <p className="popup-placeholder">
          Extension loaded. Visit a supported AI platform to begin tracking.
        </p>
      </div>
    </div>
  );
}

export default App;
