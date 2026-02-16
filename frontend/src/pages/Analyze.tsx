import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, startAnalysis, getTaskStatus } from '../api';
import { UploadCloud, Activity, AlertCircle } from 'lucide-react';

export default function Analyze() {
    const [file, setFile] = useState<File | null>(null);
    const [estimate, setEstimate] = useState<{ text_length: number, estimated_tokens: number } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const navigate = useNavigate();
    const apiKey = localStorage.getItem('openai_api_key');

    if (!apiKey) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><p>Please set API Key first.</p></div>;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setEstimate(null);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const res = await uploadFile(file);
            setEstimate({
                text_length: res.text_length,
                estimated_tokens: res.estimated_tokens
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleStartAnalysis = async () => {
        if (!file) return;
        try {
            const res = await startAnalysis(file.name, apiKey);
            setTaskId(res.task_id);
            setStatus('processing');
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        let interval: any;
        if (taskId && status !== 'completed' && status !== 'failed') {
            interval = setInterval(async () => {
                try {
                    const res = await getTaskStatus(taskId);
                    setProgress(res.progress);
                    setStatus(res.status);
                    if (res.message) setStatusMessage(res.message);

                    if (res.status === 'completed') {
                        clearInterval(interval);
                        navigate(`/book/${res.result.book_id}`);
                    }
                    if (res.status === 'failed') {
                        clearInterval(interval);
                        setError(res.error || 'Analysis failed');
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [taskId, status, navigate]);

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Analyze New Book</h1>

            <div className="card" style={{ padding: '3rem' }}>
                {!taskId ? (
                    <>
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
                            <UploadCloud size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>Upload your Book</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Supports .pdf and .txt files</p>

                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf,.txt"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                {file ? file.name : 'Select File'}
                            </label>
                        </div>

                        {error && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {file && (
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                {!estimate ? (
                                    <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ minWidth: '200px' }}>
                                        {uploading ? 'Uploading & Verifying...' : 'Verify & Estimate Cost'}
                                    </button>
                                ) : (
                                    <div className="card" style={{ background: 'var(--bg-tertiary)', border: 'none', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>File Size</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{estimate.text_length.toLocaleString()} chars</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Est. Cost</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#10b981' }}>
                                                    ${(estimate.estimated_tokens / 1000000 * 0.15).toFixed(4)}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-primary" onClick={handleStartAnalysis} style={{ width: '100%', padding: '0.8rem' }}>
                                            Start Analysis
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <Activity size={48} color="var(--accent-primary)" className="spin" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
                        <h2 style={{ marginBottom: '0.5rem' }}>Analyzing Book...</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{statusMessage || 'Processing...'}</p>

                        <div style={{ background: 'var(--bg-tertiary)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{progress}%</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
