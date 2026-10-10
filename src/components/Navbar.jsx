import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HOME, Session } from '../api';

const NAV = {
  RESIDENT: [
    { to: '/resident/dashboard', label: 'Dashboard' },
    { to: '/resident/report', label: 'Report Issue' },
    { to: '/resident/complaints', label: 'My Complaints' },
    { to: '/chat', label: 'Community Chat' }
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/directory', label: 'Residents & Technicians' },
    { to: '/chat', label: 'Community Chat' }
  ],
  TECHNICIAN: [
    { to: '/technician', label: 'My Work' },
    { to: '/chat', label: 'Community Chat' }
  ]
};

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const logout = () => { Session.clear(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to={HOME[user.role]}>
          <span className="brand-icon">🏢</span><span>Apartment Tracker</span>
        </Link>
        <nav className="nav-links">
          <div className="nav-group">
            {NAV[user.role].map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          </div>
        </nav>
        <div className="nav-right">
          <span className="user-chip">{user.name}</span>
          <button type="button" className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </div>
    </header>
  );
}
