// src/pages/Community.jsx
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Youtube, ExternalLink, Loader, Send, User } from 'lucide-react';
import { api } from '../api/client';

export default function Community({ patients, activePatientId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState({});
    const [activePatient, setActivePatient] = useState(null);

    useEffect(() => {
        if (patients && activePatientId) {
            setActivePatient(patients.find(p => p.id === activePatientId));
        }
    }, [patients, activePatientId]);

    const loadPosts = async () => {
        try {
            const data = await api.getBlogPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to load blog posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleLike = async (postId) => {
        try {
            const res = await api.likePost(postId);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.new_likes } : p));
        } catch (err) {
            console.error("Failed to like post:", err);
        }
    };

    const handleComment = async (postId) => {
        const text = commentText[postId];
        if (!text || !text.trim()) return;

        try {
            const author = activePatient?.name || "Anonymous User";
            await api.addComment(postId, author, text);
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            // Reload posts to show new comment
            loadPosts();
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
                <Loader className="spin" size={40} color="var(--brand-1)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading Community Resources...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🤝 Community & Learning</h1>
                    <p className="page-subtitle">Expert resources, patient stories, and the latest in neurological research.</p>
                </div>
                <div className="badge badge-purple">COMMUNITY HUB</div>
            </div>

            <div className="page-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                    {posts.map(post => {
                        const ytId = getYoutubeId(post.url);
                        return (
                            <div key={post.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Video Player */}
                                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                    {ytId ? (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                            <iframe
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&origin=${window.location.origin}`}
                                                title={post.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                referrerPolicy="strict-origin-when-cross-origin"
                                            />
                                            {/* Minimalist Overlay Link if player fails */}
                                            <a
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <ExternalLink size={10} /> Open YouTube
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Youtube size={48} color="var(--text-muted)" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: 20, flex: 1 }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>{post.title}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                                        {post.description}
                                    </p>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-pink)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                        >
                                            <Heart size={18} fill={post.likes > 0 ? "var(--accent-pink)" : "none"} color={post.likes > 0 ? "var(--accent-pink)" : "currentColor"} />
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{post.likes}</span>
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                            <MessageCircle size={18} />
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{post.comments?.length || 0}</span>
                                        </div>
                                        <button style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'var(--text-muted)' }}>
                                            <Share2 size={18} />
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {post.comments?.length > 0 ? post.comments.map((c, idx) => (
                                                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-cyan)' }}>{c.author}</span>
                                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(c.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.content}</div>
                                                </div>
                                            )) : (
                                                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '10px 0' }}>
                                                    Be the first to comment!
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Comment Input */}
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentText[post.id] || ''}
                                                onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 20,
                                                    padding: '8px 40px 8px 16px',
                                                    fontSize: 12,
                                                    color: 'var(--text-primary)',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={() => handleComment(post.id)}
                                                style={{ position: 'absolute', right: 4, top: 4, background: 'var(--brand-1)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
