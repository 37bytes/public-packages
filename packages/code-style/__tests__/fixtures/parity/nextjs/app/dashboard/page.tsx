'use client';

// parity: no-default-export override for Next.js App Router files missing in OxLint and Biome
// ESLint nextjsOverrides (eslint/config.js:265-283) turns off import-x/no-default-export for this file.
// OxLint: import/no-default-export=error globally, no App Router override — fires here.
// Biome: noDefaultExport=error globally, no App Router override — fires here.
// This is the standard Next.js App Router page — it MUST have a default export.

interface PageProps {
    params: { id: string };
}

// Required by Next.js App Router convention — ESLint silent; OxLint/Biome error
export default function DashboardPage({ params }: PageProps) {
    // parity: no-default-export — ESLint=off (nextjsOverrides); OxLint/Biome=error
    return <main>Dashboard {params.id}</main>;
}
