import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { API, Session } from '../api';
import { useLive } from '../hooks/useLive';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';
import StatusForm from '../components/StatusForm';

const VIEWS = ['dashboard', 'directory'];

/** Technician dropdown + Assign button for one complaint. */
function AssignForm({ complaint, technicians, onAssign }) {
  const select = useRef(null);
  const current = complaint.assignedTo ? String(complaint.assignedTo.id) : '';
  return (
    <form className="inline-form" onSubmit={(e) => { e.preventDefault(); onAssign(complaint.id, Number(select.current.value)); }}>
      <select ref={select} key={current} defaultValue={current} required>
        <option value="" disabled>Select technician</option>
        {technicians.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
      </select>
      <button type="submit" className="btn btn-small">Assign</button>
    </form>
  );
}

function Directory({ list, withDepartment }) {
  if (!list.length) return <p className="empty-state">None yet.</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th>
          {withDepartment ? <th>Department</th> : <th>Flat</th>}
          <th>Phone</th>{!withDepartment && <th>Status</th>}
        </tr>
      </thead>
      <tbody>
        {list.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td><td>{u.email}</td>
            <td>{withDepartment ? u.department : u.flatNumber}</td>
            <td>{u.phone}</td>
            {!withDepartment && (
              <td>{u.approved
                ? <span className="badge badge-RESOLVED">Approved</span>
                : <span className="badge badge-PENDING">Pending Approval</span>}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Admin() {
  const { view } = useParams();
  const toast = useToast();
  const user = useMemo(() => Session.user(), []);
  const [complaints, setComplaints] = useState([]);
  const [residents, setResidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const [c, r, t] = await Promise.all([
        API.get('/api/admin/complaints'), API.get('/api/admin/residents'), API.get('/api/admin/technicians')]);
      setComplaints(c); setResidents(r); setTechnicians(t);
    } catch (e) { toast(e.message, 'error'); }
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);
  useLive('/topic/complaints', () => setTimeout(refresh, 300));

  if (!VIEWS.includes(view)) return <Navigate to="/admin/dashboard" replace />;

  const act = async (request, okMessage) => {
    try { await request(); toast(okMessage); refresh(); }
    catch (e) { toast(e.message, 'error'); }
  };
  const assign = (id, technicianId) => act(() => API.post(`/api/admin/complaints/${id}/assign`, { technicianId }), 'Technician assigned.');
  const setStatus = (id, status) => act(() => API.post(`/api/admin/complaints/${id}/status`, { status }), 'Status updated.');
  const approve = (id) => act(() => API.post(`/api/admin/residents/${id}/approve`), 'Resident approved — they can now sign in.');

  const pending = residents.filter((r) => !r.approved);
  const count = (s) => complaints.filter((c) => c.status === s).length;

  return (
    <Layout user={user}>
      {view === 'dashboard' && (
        <section className="view">
          <div className="page-head"><div><h1>Admin Dashboard</h1>
            <p className="muted">Manage every complaint, assign technicians and track resolution.</p></div></div>

          <div className="stats-grid">
            <Stat label="Total Complaints" value={complaints.length} />
            <Stat label="Pending" value={count('PENDING')} kind="stat-pending" />
            <Stat label="In Progress" value={count('IN_PROGRESS')} kind="stat-progress" />
            <Stat label="Resolved" value={count('RESOLVED')} kind="stat-resolved" />
          </div>

          {pending.length > 0 && (
            <section className="card pending-card">
              <div className="card-head"><h2>⏳ Pending Resident Approvals <span className="pending-count">{pending.length}</span></h2></div>
              <div className="pending-list">
                {pending.map((p) => (
                  <div className="pending-row" key={p.id}>
                    <div>
                      <div className="cell-title">{p.name}</div>
                      <div className="cell-sub">{p.email} · Flat {p.flatNumber} · {p.phone}</div>
                    </div>
                    <button type="button" className="btn btn-small btn-primary" onClick={() => approve(p.id)}>Approve</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <div className="card-head"><h2>Recent Complaints</h2></div>
            {complaints.length === 0 ? <p className="empty-state">No complaints to show yet.</p> : (
              <table className="table table-wide">
                <thead>
                  <tr><th>ID</th><th>Issue</th><th>Resident</th><th>Location</th><th>Status</th><th>Assign Technician</th><th>Update Status</th></tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td>{c.complaintCode}</td>
                      <td><div className="cell-title">{c.title}</div><div className="cell-sub">{c.issueTypeLabel}</div></td>
                      <td><div>{c.createdBy.name}</div><div className="cell-sub">{c.createdBy.flatNumber}</div></td>
                      <td>{c.location}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td><AssignForm complaint={c} technicians={technicians} onAssign={assign} /></td>
                      <td>
                        {c.assignedTo
                          ? <StatusForm complaint={c} allowed={['PENDING', 'IN_PROGRESS', 'RESOLVED']} onSubmit={setStatus} />
                          : <span className="cell-sub">Assign a technician first ↑</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </section>
      )}

      {view === 'directory' && (
        <section className="view">
          <div className="page-head"><div><h1>Community Directory</h1>
            <p className="muted">Every resident and technician registered in the system.</p></div></div>
          <section className="card" style={{ marginBottom: 22 }}>
            <div className="card-head"><h2>🏠 Residents <span className="pending-count">{residents.length}</span></h2></div>
            <Directory list={residents} withDepartment={false} />
          </section>
          <section className="card">
            <div className="card-head"><h2>🔧 Technicians <span className="pending-count">{technicians.length}</span></h2></div>
            <Directory list={technicians} withDepartment />
          </section>
        </section>
      )}
    </Layout>
  );
}
