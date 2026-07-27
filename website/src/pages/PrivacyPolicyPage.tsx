// src/pages/PrivacyPolicyPage.tsx
// Privacy Policy per PRD Section 14.2.

export function PrivacyPolicyPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans text-stone-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
      <p className="text-xs text-stone-500 mb-8">Last updated: July 27, 2026</p>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">1. Overview & Privacy Commitment</h2>
          <p>
            AI Token Tracker ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our browser extension and companion web dashboard process information. Our core architecture is **privacy-first**: all token estimation happens locally inside your browser, and raw prompt text is never saved or transmitted.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">2. Information We Process</h2>
          <p className="mb-2"><strong>Local In-Memory Processing:</strong> When you send or receive a message on a supported AI chat platform, the extension extracts message text to estimate token counts. This text is tokenized in-memory and immediately discarded. It is never stored in browser storage or sent to our servers.</p>
          <p className="mb-2"><strong>Local Storage Data:</strong> Estimated token counts, model names, platform IDs, timestamps, and session durations are stored locally in your browser via <code className="bg-stone-200 px-1 font-mono">chrome.storage.local</code>.</p>
          <p><strong>Cloud Synchronized Data (Optional):</strong> If you choose to create an account and enable Cloud Sync, only aggregated numerical counts (session ID, platform ID, model name, estimated tokens, estimated cost, timestamp) are synchronized to our backend database.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">3. Third-Party Services</h2>
          <p>
            We do not sell, rent, or share your data with third parties or advertising networks. We use Gmail SMTP solely for sending authentication verification codes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">4. Your Rights & Data Deletion</h2>
          <p>
            You can delete all locally stored data at any time by uninstalling the extension or clearing extension storage. You can delete all synchronized cloud data and your account permanently via the Settings page on our web dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
