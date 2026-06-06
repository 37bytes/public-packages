// parity: no-default-export override for Next.js App Router files missing in OxLint and Biome
// Same gap as page.tsx — layout.tsx is an App Router convention file requiring default export.

interface LayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
    // parity: no-default-export — ESLint=off (nextjsOverrides); OxLint/Biome=error
    return <div className="layout">{children}</div>;
}
