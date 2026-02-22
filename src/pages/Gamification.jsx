// src/pages/Gamification.jsx  – Feature 4: Gamified Daily Check-in & Rewards
import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Zap, Calendar, Share2, Download, CheckCircle, Gift, Mic, Loader } from 'lucide-react';
import { api } from '../api/client';
import { ACHIEVEMENTS as MOCK_ACHIEVEMENTS } from '../data/mockData';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const XP_LEVELS = [
    { level: 1, title: 'Newcomer', min: 0, max: 200, color: '#94a3b8' },
    { level: 2, title: 'Observer', min: 200, max: 500, color: '#34d399' },
    { level: 3, title: 'Analyst', min: 500, max: 1000, color: '#22d3ee' },
    { level: 4, title: 'Guardian', min: 1000, max: 2000, color: '#a855f7' },
    { level: 5, title: 'NeuroMaster', min: 2000, max: 100000, color: '#fbbf24' },
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

function StreakCalendar({ sessions = [] }) {
    // Generate streak status for the current week (Mon-Sun)
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    const weekStatus = [false, false, false, false, false, false, false];

    sessions.forEach(s => {
        const d = new Date(s.recorded_at);
        if (d >= monday) {
            const dayIdx = d.getDay(); // 0-6
            const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1; // Mon=0, Sun=6
            weekStatus[adjustedIdx] = true;
        }
    });

    const completedDays = weekStatus.filter(x => x).length;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                {DAYS_OF_WEEK.map((d, i) => {
                    const isToday = (i === (currentDay === 0 ? 6 : currentDay - 1));
                    const isDone = weekStatus[i];
                    return (
                        <div key={d} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{d}</div>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, margin: '0 auto',
                                background: isDone ? 'linear-gradient(135deg,var(--brand-1),var(--brand-2))' : isToday ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                                border: isToday ? '2px dashed rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isDone ? '0 0 14px rgba(124,58,237,0.4)' : 'none',
                                transition: 'all 0.3s ease',
                            }}>
                                {isDone ? <CheckCircle size={16} color="white" /> : isToday ? <span style={{ fontSize: 16 }}>📅</span> : <span style={{ fontSize: 11, opacity: 0.3 }}>–</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Current week · {completedDays} of 7 days completed
            </div>
        </div>
    );
}

export default function Gamification({ patients = [], activePatientId, onNavigate }) {
    const activePatient = patients.find(p => p.id === activePatientId);
    const patientName = activePatient?.name || 'Valued User';

    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [showCert, setShowCert] = useState(false);
    const [animIn, setAnimIn] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [lbData, sessionData] = await Promise.all([
                    api.getLeaderboard(),
                    activePatientId ? api.getSessions(activePatientId, 365) : Promise.resolve([])
                ]);
                if (isMounted) {
                    setLeaderboard(lbData);
                    setSessions(sessionData);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load gamification data:", err);
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        setTimeout(() => setAnimIn(true), 80);
        return () => { isMounted = false; };
    }, [activePatientId]);

    const xp = activePatient?.xp || 0;
    const streakCount = activePatient?.streak_count || 0;
    const earnedAchievementIds = activePatient?.achievements || [];

    const currentLevel = XP_LEVELS.find(l => xp >= l.min && xp < l.max) || XP_LEVELS[4];
    const nextLevel = XP_LEVELS[currentLevel.level] || currentLevel;

    // Map mock achievements to real earned status
    const achievements = MOCK_ACHIEVEMENTS.map(a => ({
        ...a,
        earned: earnedAchievementIds.includes(a.id)
    }));

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
                <Loader className="spin" size={40} color="var(--brand-1)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading rewards & leaderboard...</p>
            </div>
        );
    }

    return (
        <div className={animIn ? 'fade-in' : ''}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Neuro-Vitality Dashboard</h1>
                    <p className="page-subtitle">Real-time neurological health tracking · Active Profile: {patientName}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-amber"><Flame size={11} /> {streakCount}-Day Streak</span>
                    <span className="badge badge-purple"><Star size={11} /> Level {currentLevel.level}</span>
                </div>
            </div>

            <div className="page-body">
                <div className="grid-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
                    {/* Left: Check-in + Streak */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Daily scan card */}
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
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP Per Scan</div>
                                </div>
                                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-red)', fontFamily: 'var(--font-display)' }}>{streakCount}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Days Streak</div>
                                </div>
                                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-display)' }}>{currentLevel.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current Status</div>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-xl" id="btn-daily-checkin" onClick={() => onNavigate('scan')}>
                                <Zap size={20} /> Perform Clinical Scan
                            </button>
                        </div>

                        {/* Streak calendar */}
                        <div className="card">
                            <div className="section-title"><Calendar size={16} color="var(--accent-cyan)" /> This Week&apos;s Streak</div>
                            <StreakCalendar sessions={sessions} />
                            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.08)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Gift size={16} color="var(--accent-amber)" />
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Maintain daily scans to unlock <strong style={{ color: 'var(--accent-amber)' }}>🏆 Week Warrior</strong> (7 days)!
                                </div>
                            </div>
                        </div>

                        {/* Certificate */}
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div className="section-title" style={{ justifyContent: 'center' }}><Star size={16} color="var(--accent-amber)" /> Brain Health Certificate</div>
                            {showCert ? (
                                <div className="bounce-in" style={{ border: '2px solid rgba(251,191,36,0.4)', borderRadius: 16, padding: 24, background: 'linear-gradient(135deg,rgba(251,191,36,0.08),rgba(252,211,77,0.03))', marginBottom: 16 }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🧠🏅</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--accent-amber)', marginBottom: 4 }}>Cognitive Wellness Award</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Awarded to <strong>{patientName}</strong></div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Consistent neurological monitoring streak: {streakCount} days</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Verified by NeuroVoice AI Real-Time Biomarker Engine</div>
                                </div>
                            ) : (
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Generate a verified health certificate based on your scan consistency.</p>
                            )}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={() => setShowCert(!showCert)}>
                                    <Star size={15} /> {showCert ? 'Hide' : 'View'} Certificate
                                </button>
                                {showCert && (
                                    <>
                                        <button className="btn btn-ghost"><Share2 size={15} /> Share</button>
                                        <button className="btn btn-ghost"><Download size={15} /> PDF</button>
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
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level {currentLevel.level} · {xp.toLocaleString()} XP total</div>
                                </div>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${currentLevel.color}22`, border: `2px solid ${currentLevel.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={22} color={currentLevel.color} />
                                </div>
                            </div>
                            <XPBar current={xp - currentLevel.min} max={nextLevel.min - currentLevel.min} color={currentLevel.color} />
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
                                {nextLevel.min > xp ? `${(nextLevel.min - xp).toLocaleString()} XP to NEXT LEVEL` : 'MAX LEVEL REACHED'}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="card">
                            <div className="section-title"><Trophy size={16} color="var(--accent-amber)" /> Achievements</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                {achievements.map(a => (
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
                            <div className="section-title"><Star size={16} color="var(--accent-cyan)" /> Live Leaderboard</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {leaderboard.map((p, idx) => {
                                    const isMe = p.id === activePatientId;
                                    return (
                                        <div key={p.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                            borderRadius: 10, background: isMe ? 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))' : 'rgba(255,255,255,0.03)',
                                            border: isMe ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.04)',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <div style={{ fontFamily: 'var(--font-display)', width: 24, fontSize: 16, textAlign: 'center', fontWeight: 700, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7c44' : 'var(--text-muted)' }}>
                                                {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                            </div>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                                {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                                                    {p.name} {isMe && <span style={{ fontSize: 11, color: 'var(--accent-purple)' }}>(You)</span>}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {p.streak}-day streak</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-amber)' }}>{p.xp.toLocaleString()}</div>
                                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>XP</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {leaderboard.length === 0 && (
                                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', padding: 20 }}>No players on the leaderboard yet. Start scanning to rank up!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
