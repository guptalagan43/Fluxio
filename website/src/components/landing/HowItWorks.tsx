// src/components/landing/HowItWorks.tsx
export function HowItWorks(): JSX.Element {
  const steps = [
    { num: '1', title: 'Install Extension', desc: 'Add AI Token Tracker to Chrome or Brave from the Chrome Web Store in one click.' },
    { num: '2', title: 'Chat as Normal', desc: 'Open ChatGPT, Claude, Gemini, or any supported platform. The extension tracks tokens automatically.' },
    { num: '3', title: 'Monitor & Optimize', desc: 'Click the extension icon or log into the web dashboard for budget alerts, rollups, and model suggestions.' },
  ];

  return (
    <section className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-stone-900">How It Works</h2>
          <p className="text-stone-600 mt-2">Get started in less than 30 seconds with no complex API keys required.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-amber-800 text-stone-100 text-xl font-mono font-bold flex items-center justify-center mb-6">
                {s.num}
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{s.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// src/components/landing/Screenshots.tsx
export function Screenshots(): JSX.Element {
  return (
    <section className="py-20 bg-stone-100 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-stone-900">Designed for Simplicity & Speed</h2>
          <p className="text-stone-600 mt-2">Sleek, dark-mode inspired UI that looks right at home on modern OS setups.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-stone-900 p-6 border border-stone-800 text-stone-100 font-mono text-xs shadow-2xl">
            <div className="text-amber-500 font-bold mb-4">// EXTENSION POPUP PREVIEW</div>
            <div className="border border-stone-700 p-4 space-y-3 bg-stone-950">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="font-bold text-white">ChatGPT</span>
                <span className="text-stone-400">gpt-4o</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens used</span>
                <span className="text-amber-400 font-bold">~14,250</span>
              </div>
              <div className="flex justify-between">
                <span>Est. cost</span>
                <span className="text-amber-400 font-bold">~$0.0428</span>
              </div>
              <div className="w-full bg-stone-800 h-2 mt-2">
                <div className="bg-amber-600 h-full w-[65%]" />
              </div>
              <div className="text-[10px] text-stone-400 text-right">$3.25 / $5.00 this week</div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-300 p-6 shadow-xl">
            <div className="text-stone-900 font-bold text-sm mb-4">WEB DASHBOARD ANALYTICS</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-100 border border-stone-200">
                  <div className="text-[10px] text-stone-500 uppercase">Tokens (7d)</div>
                  <div className="text-lg font-mono font-bold text-stone-900">184,920</div>
                </div>
                <div className="p-3 bg-stone-100 border border-stone-200">
                  <div className="text-[10px] text-stone-500 uppercase">Cost (7d)</div>
                  <div className="text-lg font-mono font-bold text-amber-800">$0.4215</div>
                </div>
              </div>
              <div className="p-3 bg-stone-100 border border-stone-200 text-xs text-stone-600">
                📊 Daily breakdown chart & model efficiency comparison tables available in full dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
