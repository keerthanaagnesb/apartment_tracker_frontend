import { useCallback, useEffect, useMemo, useState } from 'react';
import { API, Session } from '../api';
import { useLive } from '../hooks/useLive';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';
import StatusForm from '../components/StatusForm';

export default function Technician() {
  const toast = useToast();
  const user = useMemo(() => Session.user(), []);
  const [jobs, setJobs] = useState([]);
  const plumber = /plumb/i.test(user.department || '');

  const refresh = useCallback(async () => {
    try { setJobs(await API.get('/api/technician/complaints')); }
    catch (e) { toast(e.message, 'error'); }
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);
  useLive('/topic/complaints', () => setTimeout(refresh, 300));

  const setStatus = async (id, status) => {
    try { await API.post(`/api/technician/complaints/${id}/status`, { status }); toast('Status updated.'); refresh(); }
    catch (e) { toast(e.message, 'error'); }
  };
  const count = (s) => jobs.filter((c) => c.status === s).length;

  return (
    <Layout user={user}>
      <section className="view">
        <div className="page-head"><div>
          <h1>{plumber ? '🔧' : '⚡'} My Assigned Work</h1>
          <p className="muted">Department: {user.department} · Update the status of jobs assigned to you.</p>
        </div></div>

        <div className="stats-grid">
          <Stat label="Total Assigned" value={jobs.length} />
          <Stat label="Not Started" value={count('ASSIGNED')} kind="stat-pending" />
          <Stat label="In Progress" value={count('IN_PROGRESS')} kind="stat-progress" />
          <Stat label="Resolved" value={count('RESOLVED')} kind="stat-resolved" />
        </div>

        <section className="card">
          <div className="card-head"><h2>Assigned to Me</h2></div>
          {jobs.length === 0 ? <p className="empty-state">Nothing assigned to you yet.</p> : (
            <table className="table table-wide">
              <thead><tr><th>ID</th><th>Issue</th><th>Resident</th><th>Location</th><th>Status</th><th>Update Status</th></tr></thead>
              <tbody>
                {jobs.map((c) => (
                  <tr key={c.id}>
                    <td>{c.complaintCode}</td>
                    <td><div className="cell-title">{c.title}</div><div className="cell-sub">{c.issueTypeLabel}</div></td>
                    <td><div>{c.createdBy.name}</div><div className="cell-sub">{c.createdBy.flatNumber}</div></td>
                    <td>{c.location}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><StatusForm complaint={c} allowed={['IN_PROGRESS', 'RESOLVED']} onSubmit={setStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </Layout>
  );
}
