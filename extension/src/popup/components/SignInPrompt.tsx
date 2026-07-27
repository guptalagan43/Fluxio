// src/popup/components/SignInPrompt.tsx
// Modal shown when JWT is absent and user clicks "View dashboard".

interface SignInPromptProps {
  onClose: () => void;
}

export function SignInPrompt({ onClose }: SignInPromptProps): JSX.Element {
  function handleSignIn() {
    chrome.tabs.create({ url: 'https://yourwebsite.com/login?source=extension' });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          padding: '24px',
          width: '260px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}
        >
          Sign in required
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}
        >
          Sign in to view your full usage dashboard, enable cloud sync, and access your data across devices.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSignIn}
            style={{
              flex: 1,
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'var(--border-default)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
