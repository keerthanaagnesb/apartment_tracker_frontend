import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API, HOME, Session } from '../api';
import { useBodyClass } from '../hooks/useLive';

export default function Login() {
  useBodyClass('auth-body');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(params.get('expired') ? 'Your session expired. Please sign in again.' : '');
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(Session.token() ? Session.user() : null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await API.post('/api/auth/login', { email, password });
      Session.save(res.token, res.user);
      navigate(HOME[res.user.role]);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon big">🏢</span>
          <h1>Apartment Community<br />Issue Tracker</h1>
          <p className="tagline">Report · Track · Resolve · Build a Better Community</p>
        </div>

        {current && (
          <div className="demo-box" style={{ marginBottom: 18 }}>
            <strong>This tab is signed in as {current.name}</strong> <span className="muted">({current.role})</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Link className="btn btn-small btn-primary" to={HOME[current.role]}>Continue to my dashboard</Link>
              <button type="button" className="btn btn-small btn-ghost"
                      onClick={() => { Session.clear(); setCurrent(null); }}>Logout &amp; sign in as someone else</button>
            </div>
          </div>
        )}

        <h2 className="auth-title">Sign in</h2>
        {error && <p className="alert alert-error">{error}</p>}

        <form className="auth-form" onSubmit={submit}>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@apartment.com" required autoFocus />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>

        <p className="auth-switch">New resident? <Link to="/register">Create an account</Link></p>

        <div className="demo-box">
          <strong>Demo accounts</strong> <span className="muted">(password: password123)</span>
          <ul>
            <li><b>Admin:</b> admin@apartment.com</li>
            <li><b>Electrician:</b> tech.electric@apartment.com</li>
            <li><b>Plumber:</b> tech.plumber@apartment.com</li>
            <li><b>Resident:</b> resident1@apartment.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
