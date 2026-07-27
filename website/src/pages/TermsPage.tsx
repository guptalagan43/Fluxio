// src/pages/TermsPage.tsx
// Terms of Service per PRD Section 14.3.

export function TermsPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans text-stone-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
      <p className="text-xs text-stone-500 mb-8">Last updated: July 27, 2026</p>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">1. Acceptance of Terms</h2>
          <p>By installing the AI Token Tracker extension or accessing our website, you agree to be bound by these Terms of Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">2. Description of Service</h2>
          <p>AI Token Tracker provides token volume estimations, pricing calculations, and budget alert tools across third-party AI web interfaces. Token counts and cost calculations are estimates provided for informational and budget-planning purposes only.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">3. Disclaimer of Warranties & Estimation Notice</h2>
          <p>Calculations are labeled with "~" to indicate estimation. Exact API billing by vendors (OpenAI, Anthropic, Google, etc.) depends on internal tokenizers and billing rules. We make no guarantees of exact billing precision.</p>
        </section>
      </div>
    </div>
  );
}
