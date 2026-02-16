import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import { getBookGraph } from '../api';
import { ArrowLeft, Share2, ZoomIn, ZoomOut, Users, Settings } from 'lucide-react';

export default function BookView() {
    const { id } = useParams();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const navigate = useNavigate();
    const fgRef = useRef<any>();

    useEffect(() => {
        if (!id) return;
        getBookGraph(id).then((data) => {
            setGraphData(data);
            setLoading(false);
        });
    }, [id]);

    const filteredData = {
        nodes: graphData.nodes.filter((n: any) => (n.val || 1) > filter),
        links: graphData.links
    };

    const handleZoomIn = () => {
        fgRef.current?.zoomToFit(400, 10);
    };

    return (
        <div style={{ height: 'calc(100vh - 70px)', position: 'relative', background: '#000011', overflow: 'hidden' }}>
            {loading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', zIndex: 10 }}>
                    Loading Graph...
                </div>
            )}

            {!loading && (
                <ForceGraph3D
                    ref={fgRef}
                    graphData={filteredData}
                    nodeLabel="id"
                    nodeColor={(node: any) => node.group === 1 ? '#6366f1' : '#f43f5e'}
                    nodeVal={(node: any) => node.val || 1}
                    linkColor={() => '#ffffff33'}
                    backgroundColor="#000011"
                />
            )}

            {/* Overlay Controls */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 20 }}>
                <button onClick={() => navigate('/books')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(4px)' }}>
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            {/* Right Panel */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '300px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100% - 2rem)',
                transition: 'transform 0.3s ease',
                transform: showControls ? 'translateX(0)' : 'translateX(320px)'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Share2 size={16} /> Graph Controls
                    </h3>
                    <button onClick={() => setShowControls(false)} style={{ background: 'none', color: 'rgba(255,255,255,0.5)', padding: '0.2rem' }}>✕</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Filter Nodes (Size)</label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={filter}
                            onChange={(e) => setFilter(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Min Size: {filter}</div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={16} /> Top Characters
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {graphData.nodes
                                .sort((a: any, b: any) => (b.val || 0) - (a.val || 0))
                                .slice(0, 10)
                                .map((n: any) => (
                                    <span key={n.id} style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.4)'
                                    }}>
                                        {n.id}
                                    </span>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleZoomIn} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
                        <ZoomIn size={16} /> Fit
                    </button>
                    <button onClick={() => fgRef.current?.zoomToFit(1000)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
                        <ZoomOut size={16} /> Reset
                    </button>
                </div>
            </div>

            {!showControls && (
                <button
                    onClick={() => setShowControls(true)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 20, background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <Settings size={20} />
                </button>
            )}
        </div>
    );
}
