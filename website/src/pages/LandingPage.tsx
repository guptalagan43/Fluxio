// src/pages/LandingPage.tsx
// Public landing page assembling Hero, Features, Platforms, HowItWorks, Screenshots, FAQ.

import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Platforms } from '../components/landing/Platforms';
import { HowItWorks, Screenshots } from '../components/landing/HowItWorks';
import { FAQ } from '../components/landing/FAQ';

export function LandingPage(): JSX.Element {
  return (
    <div>
      <Hero />
      <Features />
      <Platforms />
      <HowItWorks />
      <Screenshots />
      <FAQ />
    </div>
  );
}
