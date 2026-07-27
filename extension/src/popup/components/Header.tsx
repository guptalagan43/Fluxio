// src/popup/components/Header.tsx
// Popup header showing active platform icon/name and model label.

interface HeaderProps {
  platformName?: string;
  modelName?: string;
}

export function Header({ platformName = 'AI Token Tracker', modelName }: HeaderProps): JSX.Element {
  return (
    <div className="popup-header">
      <div className="flex items-center gap-2">
        <span className="popup-title">{platformName}</span>
      </div>
      {modelName && <span className="popup-subtitle">{modelName}</span>}
    </div>
  );
}
