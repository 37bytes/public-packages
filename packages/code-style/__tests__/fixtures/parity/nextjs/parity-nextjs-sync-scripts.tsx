'use client';

import Script from 'next/script';

// parity: biome/eslint-overrides.js disables @next/next/no-sync-scripts but biome/rules/nextjs.js has it in nursery
// ESLint: @next/next/no-sync-scripts=warn, but disabled by biome/eslint-overrides.js:65 in hybrid
// Biome: nursery/noSyncScripts=warn (unstable tier)
// In hybrid: ESLint rule is silenced, Biome nursery rule fires.
// Risk: if nursery rule is removed/renamed in a Biome update, there is no fallback.

// This PASSES in hybrid (ESLint disabled, Biome nursery=warn still fires):
const PageWithSyncScript = () => (
    <div>
        {/* parity: noSyncScripts/no-sync-scripts — ESLint disabled in hybrid; Biome nursery=warn; instability risk */}
        <Script src="/analytics.js" strategy="beforeInteractive" />
    </div>
);

export { PageWithSyncScript };
