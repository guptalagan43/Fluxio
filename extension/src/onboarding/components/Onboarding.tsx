// src/onboarding/components/Onboarding.tsx
// Stepper wrapper for 3-screen extension onboarding flow.

import { useState } from 'react';
import { Step1Welcome } from './Step1Welcome';
import { Step2Privacy } from './Step2Privacy';
import { Step3Budget } from './Step3Budget';

export function Onboarding(): JSX.Element {
  const [step, setStep] = useState<number>(1);

  function handleFinish() {
    window.close();
  }

  return (
    <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: step >= s ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>

      {step === 1 && <Step1Welcome onNext={() => setStep(2)} />}
      {step === 2 && <Step2Privacy onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step3Budget onBack={() => setStep(2)} onFinish={handleFinish} />}
    </div>
  );
}
