// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, AlertCircle, Brain, ArrowUpRight, Mic, Calendar, Watch, Trophy, ChevronRight, Zap, Smartphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { api, checkBackendHealth } from '../api/client';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)' }}>Score: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ onNavigate, activePatientId, activePage }) {
    const [animIn, setAnimIn] = useState(false);
    const [stats, setStats] = useState([]);
    const [history, setHistory] = useState([]);
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        setTimeout(() => setAnimIn(true), 100);
    }, []);

    useEffect(() => {
        if (!activePatientId) return;

        const fetchData = async () => {
            try {
                // Fetch patient and session history from real implementation
                const result = await api.getPatient(activePatientId);
                if (!result) return;

                const { patient: pData, sessions = [] } = result;
                setPatient(pData);

                if (sessions && sessions.length > 0) {
                    // Format for chart - last 7 sessions
                    const chartData = [...sessions].reverse().slice(-7).map(s => ({
                        day: new Date(s.recorded_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                        score: Math.round(s.risk_score || 0),
                        risk: s.risk_label || 'Unknown',
                        // Detailed biomarkers for the table
                        fo: s.fo_mean?.toFixed(1) || '—',
                        jitter: s.jitter_local ? (s.jitter_local * 100).toFixed(2) + '%' : '—',
                        shimmer: s.shimmer_local ? (s.shimmer_local * 100).toFixed(2) + '%' : '—',
                        hnr: s.hnr?.toFixed(1) || '—'
                    }));
                    setHistory(chartData);

                    // Update stats with the latest real session
                    const latest = sessions[0];
                    setStats([
                        { label: 'Risk Score', value: Math.round(latest.risk_score || 0), unit: '/100', change: 'Live from AI', trend: (latest.risk_score || 0) > 50 ? 'down' : 'up', icon: Brain, color: 'var(--accent-purple)', bg: 'rgba(168,85,247,0.12)' },
                        { label: 'Total Scans', value: sessions.length, unit: '', change: 'All-time', trend: 'up', icon: Mic, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.10)' },
                        { label: 'Status', value: latest.risk_label || 'N/A', unit: '', change: 'Clinical Index', trend: 'up', icon: Activity, color: latest.risk_label === 'Low' ? 'var(--accent-green)' : 'var(--accent-amber)', bg: 'rgba(52,211,153,0.10)' },
                        { label: 'Vocal Stability', value: latest.jitter_local ? (100 - (latest.jitter_local * 1000)).toFixed(1) : '—', unit: '%', change: 'Stability', trend: 'up', icon: TrendingUp, color: 'var(--accent-green)', bg: 'rgba(52,211,153,0.10)' },
                    ]);
                } else {
                    setHistory([]);
                    setStats([
                        { label: 'Risk Score', value: '—', unit: '', change: 'No Data', trend: 'up', icon: Brain, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
                        { label: 'Total Scans', value: '0', unit: '', change: 'Start Now', trend: 'up', icon: Mic, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.10)' },
                        { label: 'Status', value: 'Idle', unit: '', change: 'Ready', trend: 'up', icon: Activity, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
                        { label: 'Vocal Stability', value: '—', unit: '', change: 'No Data', trend: 'up', icon: TrendingUp, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
                    ]);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            }
        };

        fetchData();
    }, [activePatientId, activePage]);

    const quickActions = [
        { id: 'scan', label: 'Start Voice Scan', desc: 'Analyze biomarkers now', icon: Mic, color: 'var(--brand-1)' },
        { id: 'appointment', label: 'AI Triage Bot', desc: 'Find & book a doctor', icon: Calendar, color: 'var(--accent-cyan)' },
        { id: 'wearable', label: 'Wearable Fusion', desc: 'Sync health data', icon: Watch, color: 'var(--accent-green)' },
        { id: 'gamification', label: 'Daily Check-in', desc: 'Earn XP & badges', icon: Trophy, color: 'var(--accent-amber)' },
    ];

    if (!activePatientId) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: 100 }}>
                <Users size={64} color="var(--text-muted)" style={{ marginBottom: 20 }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>No Patient Profile Active</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Please register or select a patient to view clinical analytics.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('patients')}>Go to Patient Registry</button>
            </div>
        );
    }

    return (
        <div className={animIn ? 'fade-in' : ''} style={{ opacity: animIn ? 1 : 0 }}>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome Back, {patient?.name || 'User'}</h1>
                    <p className="page-subtitle">Your neurological health summary · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate('scan')}>
                    <Mic size={16} /> Start Today&apos;s Scan
                </button>
            </div>

            <div className="page-body">
                {/* Stats */}
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="stat-icon-wrap" style={{ background: s.bg }}>
                                <s.icon size={22} color={s.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="stat-value" style={{ color: s.color }}>
                                    {s.value}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{s.unit}</span>
                                </div>
                                <div className="stat-label">{s.label}</div>
                                <div className={`stat-change ${s.trend}`}>
                                    <ArrowUpRight size={11} /> {s.change}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart + Quick Actions */}
                <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                    {/* Chart */}
                    <div className="card">
                        <div className="section-title">
                            <TrendingUp size={18} color="var(--accent-cyan)" />
                            Brain Health Score — Trend
                        </div>
                        {history.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--brand-2)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--brand-2)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="score" stroke="var(--brand-2)" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: 'var(--brand-2)', r: 4 }} activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                                No scan history yet. Complete a scan to see trends.
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    {/* Mobile Access / Phone Sync Card */}
                    <div className="card card-gradient-cyan" style={{ border: '1px solid var(--accent-cyan)44' }}>
                        <div className="section-title">
                            <Smartphone size={18} color="var(--accent-cyan)" />
                            Phone Access
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Access your clinical dashboard and recording tools on the move:
                            </p>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                                https://{window.location.hostname}:5174
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', background: 'rgba(251,191,36,0.08)', padding: '8px 12px', borderRadius: 6 }}>
                                <AlertCircle size={14} color="var(--accent-amber)" />
                                <span>Note: You must trust the self-signed SSL certificate in your mobile browser first.</span>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => window.open(`https://${window.location.hostname}:8001/health`, '_blank')}>
                                Trust Backend Certificate
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="section-title">
                            <Zap size={18} color="var(--accent-amber)" />
                            Quick Actions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {quickActions.map(a => (
                                <button key={a.id} className="appointment-card" style={{ width: '100%', textAlign: 'left', background: 'none' }} onClick={() => onNavigate(a.id)}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <a.icon size={18} color={a.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
                                    </div>
                                    <ChevronRight size={16} color="var(--text-muted)" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Biomarker Table */}
                <div className="card">
                    <div className="section-title">
                        <Activity size={18} color="var(--accent-purple)" />
                        Recent Biomarker Readings
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Date', 'Freq (F0)', 'Jitter (Instability)', 'Shimmer (leakage)', 'Clarity (HNR)', 'Risk'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                        <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.day}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent-cyan)' }}>{r.fo} Hz</td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent-purple)' }}>{r.jitter}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent-amber)' }}>{r.shimmer}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>{r.hnr} dB</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span className={`badge badge-${r.risk === 'Low' ? 'green' : r.risk === 'Medium' ? 'amber' : 'red'}`}>{r.risk}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No biomarker data available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

