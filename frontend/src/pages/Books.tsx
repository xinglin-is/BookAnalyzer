import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../api';
import { BookOpen, Calendar, MessageSquare, ArrowRight, Plus } from 'lucide-react';

interface BookDesc {
    id: string;
    title: string;
    graph_file: string;
    timestamp: number;
}

export default function Books() {
    const [books, setBooks] = useState<Record<string, BookDesc>>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const apiKey = localStorage.getItem('openai_api_key');

    useEffect(() => {
        getBooks()
            .then(setBooks)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Your Library</h1>
                {apiKey && (
                    <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Analyze New Book
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading books...</div>
            ) : Object.keys(books).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '1rem' }}>No books analyzed yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start by analyzing your first book to build a knowledge graph.</p>
                    {apiKey ? (
                        <button className="btn-primary" onClick={() => navigate('/analyze')}>Analyze New Book</button>
                    ) : (
                        <p style={{ color: 'var(--accent-primary)' }}>Please add an API Key on Home page to analyze new books.</p>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {Object.values(books).map((book) => (
                        <div key={book.id} className="card" onClick={() => navigate(`/book/${book.id}`)}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <BookOpen size={24} color="var(--accent-primary)" />
                                </div>
                                <button className="btn-secondary" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/chat?book=${book.id}`);
                                }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <MessageSquare size={14} /> Chat
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{book.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Calendar size={14} />
                                {new Date(book.timestamp * 1000).toLocaleDateString()}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                View Graph <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
