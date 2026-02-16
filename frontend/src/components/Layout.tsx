import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
        </div>
    );
}
