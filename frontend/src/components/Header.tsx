import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BookOpen, Search, MessageSquare, Home as HomeIcon } from 'lucide-react';

export default function Header() {
    const location = useLocation();
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const checkKey = () => setHasApiKey(!!localStorage.getItem('openai_api_key'));
        checkKey();
        window.addEventListener('apiKeyChanged', checkKey);
        return () => window.removeEventListener('apiKeyChanged', checkKey);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    return (
        <header style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <BookOpen className="text-accent" size={24} color="var(--accent-primary)" />
                <span>BookAnalyzer</span>
            </div>

            <nav style={{ display: 'flex', gap: '2rem' }}>
                <NavLink to="/" icon={<HomeIcon size={18} />} label="Home" active={isActive('/')} />
                <NavLink to="/books" icon={<BookOpen size={18} />} label="Library" active={isActive('/books')} />
                <NavLink to="/analyze" icon={<Search size={18} />} label="Analyze" active={isActive('/analyze')} />
                {hasApiKey && (
                    <NavLink to="/chat" icon={<MessageSquare size={18} />} label="Chat" active={isActive('/chat')} />
                )}
            </nav>
        </header>
    );
}

function NavLink({ to, icon, label, active }: { to: string, icon: any, label: string, active: boolean }) {
    return (
        <Link to={to} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: active ? 600 : 500,
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s',
        }}>
            {icon}
            {label}
        </Link>
    );
}
