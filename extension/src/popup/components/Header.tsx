// src/popup/components/Header.tsx
// Popup header showing active platform icon/name, model label, and settings cog button.

interface HeaderProps {
  platformName?: string;
  modelName?: string;
  onToggleSettings?: () => void;
}

export function Header({ platformName = 'AI Token Tracker', modelName, onToggleSettings }: HeaderProps): JSX.Element {
  return (
    <div className="popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div className="flex items-center gap-2">
          <span className="popup-title">{platformName}</span>
        </div>
        {modelName && <span className="popup-subtitle">{modelName}</span>}
      </div>

      {onToggleSettings && (
        <button
          onClick={onToggleSettings}
          title="Settings"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ⚙
        </button>
      )}
    </div>
  );
}
