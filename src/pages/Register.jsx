import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api';
import { useBodyClass } from '../hooks/useLive';

const EMPTY = { name: '', email: '', password: '', phone: '', flatNumber: '' };

export default function Register() {
  useBodyClass('auth-body');
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null);   // { type, text }
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await API.post('/api/auth/register', form);
      setMessage({ type: 'success', text: res.message });
      setForm(EMPTY);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setBusy(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon big">🏢</span>
          <h1>Create your resident account</h1>
          <p className="tagline">Report and track issues in your apartment community</p>
          <p className="tagline" style={{ marginTop: 4 }}>Note: an admin must approve your account before you can sign in.</p>
        </div>

        {message && <p className={'alert alert-' + message.type}>{message.text}</p>}

        <form className="auth-form" onSubmit={submit}>
          <label>Full Name <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Agnes" required /></label>
          <label>Email <input type="email" value={form.email} onChange={set('email')} placeholder="you@apartment.com" required /></label>
          <label>Password <input type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required minLength={6} /></label>
          <label>Phone Number <input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit phone number" required /></label>
          <label>Flat / Unit Number <input type="text" value={form.flatNumber} onChange={set('flatNumber')} placeholder="e.g. A-101" required /></label>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>Create Account</button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
