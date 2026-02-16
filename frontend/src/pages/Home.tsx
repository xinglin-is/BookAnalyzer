import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowRight, BookOpen, Search, MessageSquare } from 'lucide-react';

export default function Home() {
    const [apiKey, setApiKey] = useState('');
    const [storedKey, setStoredKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const key = localStorage.getItem('openai_api_key');
        if (key) setStoredKey(key);
    }, []);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('openai_api_key', apiKey.trim());
            setStoredKey(apiKey.trim());
            setApiKey('');
            window.dispatchEvent(new Event('apiKeyChanged'));
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('openai_api_key');
        setStoredKey('');
        window.dispatchEvent(new Event('apiKeyChanged'));
    };

    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Unlock the Knowledge in Your Books
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Analyze, visualize, and chat with your library using advanced AI.
            </p>

            {!storedKey ? (
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                        <Key size={20} />
                        <h3>Enter OpenAI API Key</h3>
                    </div>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Your key is stored locally in your browser and used only for analysis.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            style={{ flex: 1 }}
                        />
                        <button className="btn-primary" onClick={handleSaveKey}>Get Started</button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="card" style={{ maxWidth: '500px', margin: '0 auto 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontWeight: 500 }}>API Key Active</span>
                        </div>
                        <button onClick={handleClearKey} style={{ color: 'var(--text-secondary)', textDecoration: 'underline', background: 'none', padding: 0 }}>
                            Clear Key
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                        <FeatureCard
                            icon={<BookOpen size={32} />}
                            title="Your Library"
                            desc="Browse your analyzed books and visualize their connections."
                            action="Go to Library"
                            onClick={() => navigate('/books')}
                        />
                        <FeatureCard
                            icon={<Search size={32} />}
                            title="Analyze New Book"
                            desc="Upload PDFs or text files to extract entities and build knowledge graphs."
                            action="Start Analysis"
                            onClick={() => navigate('/analyze')}
                        />
                        <FeatureCard
                            icon={<MessageSquare size={32} />}
                            title="Chat with Books"
                            desc="Ask questions and get answers based on the content of your library."
                            action="Start Chatting"
                            onClick={() => navigate('/chat')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function FeatureCard({ icon, title, desc, action, onClick }: any) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={onClick}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{desc}</p>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {action} <ArrowRight size={16} />
            </button>
        </div>
    );
}
