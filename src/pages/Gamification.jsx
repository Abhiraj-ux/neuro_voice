// src/pages/Gamification.jsx  – Feature 4: Gamified Daily Check-in & Rewards
import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Zap, Calendar, Share2, Download, CheckCircle, Lock, Gift, Mic } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/mockData';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STREAK_STATUS = [true, true, true, true, true, false, false]; // Mon-Fri done, Sat-Sun pending

const XP_LEVELS = [
    { level: 1, title: 'Newcomer', min: 0, max: 200, color: '#94a3b8' },
    { level: 2, title: 'Observer', min: 200, max: 500, color: '#34d399' },
    { level: 3, title: 'Analyst', min: 500, max: 1000, color: '#22d3ee' },
    { level: 4, title: 'Guardian', min: 1000, max: 2000, color: '#a855f7' },
    { level: 5, title: 'NeuroMaster', min: 2000, max: 5000, color: '#fbbf24' },
];

const LEADERBOARD = [
    { rank: 1, name: 'Priya S.', avatar: '👩', xp: 1840, streak: 22, badge: '🏆' },
    { rank: 2, name: 'Ravi M.', avatar: '👨', xp: 1620, streak: 18, badge: '🥈' },
    { rank: 3, name: 'You', avatar: '🫵', xp: 425, streak: 5, badge: '🥉', isMe: true },
    { rank: 4, name: 'Anjali K.', avatar: '👩', xp: 380, streak: 4, badge: '' },
    { rank: 5, name: 'Sam T.', avatar: '👨', xp: 310, streak: 3, badge: '' },
];

function XPBar({ current, max, color }) {
    const pct = Math.min(100, (current / max) * 100);
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                <span>{current} XP</span><span>{max} XP</span>
            </div>
            <div className="progress-bar-wrap" style={{ height: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 10px ${color}66` }} />
            </div>
        </div>
    );
}

function StreakCalendar() {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                {DAYS_OF_WEEK.map((d, i) => (
                    <div key={d} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{d}</div>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, margin: '0 auto',
                            background: STREAK_STATUS[i] ? 'linear-gradient(135deg,var(--brand-1),var(--brand-2))' : i === 5 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                            border: i === 5 ? '2px dashed rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: STREAK_STATUS[i] ? '0 0 14px rgba(124,58,237,0.4)' : 'none',
                            transition: 'all 0.3s ease',
                        }}>
                            {STREAK_STATUS[i] ? <CheckCircle size={16} color="white" /> : i === 5 ? <span style={{ fontSize: 16 }}>📅</span> : <span style={{ fontSize: 11, opacity: 0.3 }}>–</span>}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Current week · 5 of 7 days completed
            </div>
        </div>
    );
}

export default function Gamification({ patients = [], activePatientId }) {
    const activePatient = patients.find(p => p.id === activePatientId);
    const patientName = activePatient?.name || 'Valued User';

    const [checkinDone, setCheckinDone] = useState(false);
    const [xp, setXp] = useState(425);
    const [showCert, setShowCert] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const [animIn, setAnimIn] = useState(false);

    // Update leaderboard with real name
    const leaderboard = [
        { rank: 1, name: 'Priya S.', avatar: '👩', xp: 1840, streak: 22, badge: '🏆' },
        { rank: 2, name: 'Ravi M.', avatar: '👨', xp: 1620, streak: 18, badge: '🥈' },
        { rank: 3, name: patientName, avatar: '🫵', xp: 425, streak: 5, badge: '🥉', isMe: true },
        { rank: 4, name: 'Anjali K.', avatar: '👩', xp: 380, streak: 4, badge: '' },
        { rank: 5, name: 'Sam T.', avatar: '👨', xp: 310, streak: 3, badge: '' },
    ];

    useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);

    const currentLevel = XP_LEVELS.find(l => xp >= l.min && xp < l.max) || XP_LEVELS[4];
    const nextLevel = XP_LEVELS[currentLevel.level] || currentLevel;

    const handleCheckin = () => {
        setCheckinDone(true);
        setConfetti(true);
        setXp(prev => prev + 25);
        setTimeout(() => setConfetti(false), 3000);
    };

    return (
        <div className={animIn ? 'fade-in' : ''}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Neuro-Vitality Dashboard</h1>
                    <p className="page-subtitle">Personalized neurological health tracking · Clinical sync active</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-amber"><Flame size={11} /> 5-Day Streak</span>
                    <span className="badge badge-purple"><Star size={11} /> Level {currentLevel.level}</span>
                </div>
            </div>

            {/* Confetti burst */}
            {confetti && (
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${Math.random() * 100}%`,
                            top: '-10px',
                            width: 8, height: 8,
                            borderRadius: Math.random() > 0.5 ? '50%' : '0',
                            background: ['#7c3aed', '#06b6d4', '#10b981', '#fbbf24', '#f472b6', '#f87171'][Math.floor(Math.random() * 6)],
                            animation: `fall ${1.5 + Math.random() * 2}s ease-in both`,
                            animationDelay: `${Math.random() * 0.8}s`,
                        }} />
                    ))}
                    <style>{`
            @keyframes fall {
              0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(${Math.random() > 0.5 ? '' : '-'}720deg); opacity: 0; }
            }
          `}</style>
                </div>
            )}

            <div className="page-body">
                <div className="grid-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
                    {/* Left: Check-in + Streak */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Daily check-in card */}
                        {!checkinDone ? (
                            <div className="card card-gradient-purple" style={{ textAlign: 'center', padding: 32 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Mic size={40} color="white" />
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Vocal Biomarker Scan</div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                                    Perform your baseline voice analysis to monitor stability and earn <strong style={{ color: 'var(--accent-amber)' }}>+25 XP</strong> for your neuro-profile.
                                </p>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                                    <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-amber)', fontFamily: 'var(--font-display)' }}>+25</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP Available</div>
                                    </div>
                                    <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-red)', fontFamily: 'var(--font-display)' }}>5</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Days Active</div>
                                    </div>
                                    <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-display)' }}>Tier 2</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Shield Level</div>
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-xl" id="btn-daily-checkin" onClick={() => onNavigate('scan')}>
                                    <Zap size={20} /> Perform Clinical Scan
                                </button>
                            </div>
                        ) : (
                            <div className="card card-gradient-green bounce-in" style={{ textAlign: 'center', padding: 32 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Trophy size={40} color="white" />
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Baseline Established!</div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                                    <span className="badge badge-amber" style={{ fontSize: 14, padding: '8px 16px' }}>+25 XP Logged</span>
                                    <span className="badge badge-red" style={{ fontSize: 14, padding: '8px 16px' }}>Streak Maintained</span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You are in the <strong style={{ color: 'white' }}>Top 12%</strong> of consistent users this month.</p>
                            </div>
                        )}

                        {/* Streak calendar */}
                        <div className="card">
                            <div className="section-title"><Calendar size={16} color="var(--accent-cyan)" /> This Week&apos;s Streak</div>
                            <StreakCalendar />
                            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Gift size={16} color="var(--accent-amber)" />
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Complete 7 days to unlock the <strong style={{ color: 'var(--accent-amber)' }}>🏆 Week Warrior</strong> badge (+250 XP)!
                                </div>
                            </div>
                        </div>

                        {/* Certificate */}
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="section-title" style={{ justifyContent: 'center' }}><Star size={16} color="var(--accent-amber)" /> Brain Health Certificate</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Share your 5-day streak certificate with your doctor or on social media!</p>
                            {showCert ? (
                                <div className="bounce-in" style={{ border: '2px solid rgba(251,191,36,0.4)', borderRadius: 16, padding: 24, background: 'linear-gradient(135deg,rgba(251,191,36,0.08),rgba(252,211,77,0.03))', marginBottom: 16 }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🧠🏅</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--accent-amber)', marginBottom: 4 }}>Brain Health Certificate</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Awarded to <strong>{patientName}</strong></div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>5-day consistent neurological monitoring streak · Feb 2026</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Verified by NeuroVoice AI · Powered by BharatGen</div>
                                </div>
                            ) : null}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={() => setShowCert(!showCert)}>
                                    <Star size={15} /> {showCert ? 'Hide' : 'View'} Certificate
                                </button>
                                {showCert && (
                                    <>
                                        <button className="btn btn-ghost"><Share2 size={15} /> Share</button>
                                        <button className="btn btn-ghost"><Download size={15} /> Export PDF</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: XP + Achievements + Leaderboard */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* XP Level */}
                        <div className="card card-gradient-purple">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: currentLevel.color }}>{currentLevel.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level {currentLevel.level} · {xp} XP total</div>
                                </div>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${currentLevel.color}22`, border: `2px solid ${currentLevel.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={22} color={currentLevel.color} />
                                </div>
                            </div>
                            <XPBar current={xp - currentLevel.min} max={nextLevel.min - currentLevel.min} color={currentLevel.color} />
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
                                {nextLevel.min - xp} XP to {nextLevel.title || 'Max Level'}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="card">
                            <div className="section-title"><Trophy size={16} color="var(--accent-amber)" /> Achievements</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                {ACHIEVEMENTS.map(a => (
                                    <div key={a.id} className={`badge-achievement${a.earned ? ' earned' : ' locked'}`}>
                                        <div className="badge-emoji">{a.earned ? a.emoji : '🔒'}</div>
                                        <div className="badge-name">{a.name}</div>
                                        <div className="badge-desc">{a.earned ? `+${a.xp} XP` : a.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="card">
                            <div className="section-title"><Star size={16} color="var(--accent-cyan)" /> Community Leaderboard</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {leaderboard.map(p => (
                                    <div key={p.rank} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                        borderRadius: 10, background: p.isMe ? 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))' : 'rgba(255,255,255,0.03)',
                                        border: p.isMe ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.04)',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        <div style={{ fontFamily: 'var(--font-display)', width: 24, fontSize: 16, textAlign: 'center', fontWeight: 700, color: p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#94a3b8' : p.rank === 3 ? '#cd7c44' : 'var(--text-muted)' }}>
                                            {p.badge || `#${p.rank}`}
                                        </div>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{p.name.split(' ').map(n => n[0]).join('')}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: p.isMe ? 700 : 500, color: p.isMe ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{p.name} {p.isMe && <span style={{ fontSize: 11, color: 'var(--accent-purple)' }}>(You)</span>}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {p.streak}-day streak</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-amber)' }}>{p.xp.toLocaleString()}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
