import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { API, ISSUE_TYPES, Session, fmtDate } from '../api';
import { useLive } from '../hooks/useLive';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';

const VIEWS = ['dashboard', 'report', 'complaints'];
const EMPTY_FORM = { issueType: '', title: '', location: '', description: '' };

function ComplaintsTable({ list, full }) {
  if (!list.length) {
    return <p className="empty-state">You haven't reported any issues yet. <Link to="/resident/report">Report your first issue</Link>.</p>;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>{full && <th>Title</th>}<th>{full ? 'Issue Type' : 'Issue'}</th><th>Location</th><th>Status</th>
          {full && <th>Assigned To</th>}<th>{full ? 'Reported On' : 'Date'}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((c) => (
          <tr key={c.id}>
            <td>{c.complaintCode}</td>
            {full && <td>{c.title}</td>}
            <td>{c.issueTypeLabel}</td>
            <td>{c.location}</td>
            <td><StatusBadge status={c.status} /></td>
            {full && <td>{c.assignedTo ? c.assignedTo.name : '—'}</td>}
            <td>{fmtDate(c.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Resident() {
  const { view } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => Session.user(), []);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const refresh = useCallback(async () => {
    try { setComplaints(await API.get('/api/user/complaints')); }
    catch (e) { toast(e.message, 'error'); }
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);
  useLive('/topic/complaints', () => setTimeout(refresh, 300));

  if (!VIEWS.includes(view)) return <Navigate to="/resident/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await API.post('/api/user/complaints', form);
      setForm(EMPTY_FORM);
      toast('Your complaint was submitted successfully!');
      await refresh();
      navigate('/resident/complaints');
    } catch (err) { toast(err.message, 'error'); }
    setBusy(false);
  };

  const count = (...statuses) => complaints.filter((c) => statuses.includes(c.status)).length;

  return (
    <Layout user={user}>
      {view === 'dashboard' && (
        <section className="view">
          <div className="page-head">
            <div>
              <h1>Welcome back, {user.name} 👋</h1>
              <p className="muted">Flat <b>{user.flatNumber}</b> · Report issues and track their status here.</p>
            </div>
            <Link to="/resident/report" className="btn btn-primary">+ Report an Issue</Link>
          </div>
          <div className="stats-grid">
            <Stat label="Total Complaints" value={complaints.length} />
            <Stat label="Pending" value={count('PENDING')} kind="stat-pending" />
            <Stat label="In Progress" value={count('ASSIGNED', 'IN_PROGRESS')} kind="stat-progress" />
            <Stat label="Resolved" value={count('RESOLVED')} kind="stat-resolved" />
          </div>
          <div className="card">
            <div className="card-head"><h2>Recent Complaints</h2><Link to="/resident/complaints" className="link">View All →</Link></div>
            <ComplaintsTable list={complaints.slice(0, 5)} full={false} />
          </div>
        </section>
      )}

      {view === 'report' && (
        <section className="view">
          <div className="page-head"><div><h1>Report an Issue</h1>
            <p className="muted">Let us know what's wrong — we'll get it assigned to the right team.</p></div></div>
          <div className="card form-card">
            <form className="stacked-form" onSubmit={submit}>
              <label>Issue Type
                <select value={form.issueType} onChange={set('issueType')} required>
                  <option value="" disabled>Select an issue type</option>
                  {ISSUE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Title <input type="text" value={form.title} onChange={set('title')} placeholder="Short summary, e.g. 'Water leakage in kitchen'" required /></label>
              <label>Location <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. A-101, Block B, Parking Area" required /></label>
              <label>Description <textarea rows={5} value={form.description} onChange={set('description')} placeholder="Describe the issue in detail..." required /></label>
              <div className="form-actions">
                <Link to="/resident/dashboard" className="btn btn-ghost">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={busy}>Submit Report</button>
              </div>
            </form>
          </div>
        </section>
      )}

      {view === 'complaints' && (
        <section className="view">
          <div className="page-head">
            <div><h1>My Complaints</h1><p className="muted">Track the status of every issue you've reported.</p></div>
            <Link to="/resident/report" className="btn btn-primary">+ Report an Issue</Link>
          </div>
          <div className="card"><ComplaintsTable list={complaints} full /></div>
        </section>
      )}
    </Layout>
  );
}
