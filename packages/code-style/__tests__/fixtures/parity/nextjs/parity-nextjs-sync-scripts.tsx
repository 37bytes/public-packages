'use client';

import Script from 'next/script';

// parity: biome/eslint-overrides.js disables @next/next/no-sync-scripts because Biome covers it
// ESLint: @next/next/no-sync-scripts=warn, disabled by biome/eslint-overrides.js in hybrid
// Biome: performance/noSyncScripts=warn
// In hybrid: ESLint is silenced and the stable Biome rule fires.

const PageWithSyncScript = () => (
    <div>
        {/* parity: noSyncScripts/no-sync-scripts — ESLint disabled in hybrid; Biome performance=warn */}
        <Script src="/analytics.js" strategy="beforeInteractive" />
    </div>
);

export { PageWithSyncScript };
