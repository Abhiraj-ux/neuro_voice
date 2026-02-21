// src/pages/Patients.jsx – Real patient registration and management
import { useState, useEffect } from 'react';
import { Users, Plus, Activity, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export default function Patients({ onNavigate, setActivePatientId }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', age: '', gender: 'Male', language: 'en', phone: '', email: '' });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.listPatients();
            setPatients(data);
        } catch (e) {
            setError(`Cannot reach backend: ${e.message}. Is the server running?`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.createPatient({ ...form, age: Number(form.age) });
            setShowForm(false);
            setForm({ name: '', age: '', gender: 'Male', language: 'en', phone: '', email: '' });
            await load();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const riskBadge = (label) => {
        if (!label) return <span className="badge badge-cyan">No scans</span>;
        const c = label === 'Low' ? 'green' : label === 'Medium' ? 'amber' : 'red';
        return <span className={`badge badge-${c}`}>{label === 'High' ? '🚨' : label === 'Medium' ? '⚠️' : '✅'} {label}</span>;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Patients</h1>
                    <p className="page-subtitle">Register and monitor real patients — data stored in SQLite</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Refresh</button>
                    <button className="btn btn-primary" id="btn-new-patient" onClick={() => setShowForm(true)}>
                        <Plus size={16} /> New Patient
                    </button>
                </div>
            </div>

            <div className="page-body">
                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                    </div>
                )}

                {/* New Patient Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
                                Register New Patient
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="label">Full Name *</label>
                                        <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Age *</label>
                                        <input className="input" type="number" min="1" max="120" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Gender</label>
                                        <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                            <option>Male</option><option>Female</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Preferred Language</label>
                                        <select className="input" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                                            <option value="en">🇬🇧 English</option>
                                            <option value="hi">🇮🇳 Hindi</option>
                                            <option value="kn">🇮🇳 Kannada</option>
                                            <option value="te">🇮🇳 Telugu</option>
                                            <option value="ta">🇮🇳 Tamil</option>
                                            <option value="es">🇪🇸 Spanish</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Phone</label>
                                        <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Email</label>
                                        <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving…' : 'Register Patient'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
                    </div>
                ) : patients.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No patients yet</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Register your first patient to begin real neurological screening.</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Register First Patient</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {patients.map(p => (
                            <div key={p.id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                onClick={() => { setActivePatientId(p.id); onNavigate('scan'); }}>
                                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-1),var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 2 }}>
                                        <span>Age {p.age} · {p.gender}</span>
                                        <span>🌐 {p.language?.toUpperCase()}</span>
                                        {p.phone && <span>📞 {p.phone}</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ marginBottom: 6 }}>{riskBadge(p.last_risk)}</div>
                                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)', justifyContent: 'flex-end' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={11} /> {p.session_count} scans</span>
                                        {p.last_scan && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {new Date(p.last_scan).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
