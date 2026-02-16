import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBooks, queryBook } from '../api';
import { Send, BookOpen, Bot, User, FileText, MessageSquare } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
}

export default function Chat() {
    const [books, setBooks] = useState<any[]>([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [searchParams] = useSearchParams();
    const apiKey = localStorage.getItem('openai_api_key');

    useEffect(() => {
        getBooks().then((data) => {
            const bookList = Object.values(data) as any[];
            setBooks(bookList);
            const bookIdParam = searchParams.get('book');
            if (bookIdParam && bookList.find((b: any) => b.id === bookIdParam)) {
                setSelectedBook(bookIdParam);
            } else if (bookList.length > 0) {
                setSelectedBook(bookList[0].id);
            }
        });
    }, [searchParams]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !selectedBook || !apiKey) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await queryBook(selectedBook, userMsg, apiKey);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.answer.answer,
                sources: res.answer.sources
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not get answer." }]);
        } finally {
            setLoading(false);
        }
    };

    const selectedBookTitle = books.find((b: any) => b.id === selectedBook)?.title || 'Select a Book';

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} color="var(--accent-primary)" />
                        Books
                    </h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {books.map((b: any) => (
                        <div key={b.id}
                            onClick={() => setSelectedBook(b.id)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                marginBottom: '0.5rem',
                                background: selectedBook === b.id ? 'var(--accent-primary)' : 'transparent',
                                color: selectedBook === b.id ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                fontWeight: selectedBook === b.id ? 500 : 400,
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {b.title}
                        </div>
                    ))}
                    {books.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            No books available.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                {/* Chat Header */}
                <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedBookTitle}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chat Mode</div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.7 }}>
                            <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
                            <p>Ask a question about this book to get started.</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {m.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="var(--text-primary)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        {m.role === 'user' ? 'You' : 'BookAnalyzer'}
                                    </div>
                                    <div style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>
                                        {m.content}
                                    </div>
                                    {m.sources && m.sources.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <details>
                                                <summary style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                                                    View Sources ({m.sources.length})
                                                </summary>
                                                <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                                                    {m.sources.map((s, si) => (
                                                        <div key={si} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-primary)' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                                <FileText size={14} /> Source {si + 1}
                                                            </div>
                                                            "{s.substring(0, 300)}..."
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div style={{ display: 'flex', gap: '1rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                Thinking
                                <span className="dot-animate" style={{ animationDelay: '0s' }}>.</span>
                                <span className="dot-animate" style={{ animationDelay: '0.2s' }}>.</span>
                                <span className="dot-animate" style={{ animationDelay: '0.4s' }}>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Ask about ${selectedBookTitle}...`}
                            disabled={loading || !selectedBook}
                            style={{ width: '100%', padding: '1rem 3.5rem 1rem 1.5rem', borderRadius: '2rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !selectedBook || !input.trim()}
                            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--accent-primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                .dot-animate { display: inline-block; animation: bounce 1s infinite; }
                
                details > summary { list-style: none; }
                details > summary::-webkit-details-marker { display: none; }
            `}</style>
        </div>
    );
}
