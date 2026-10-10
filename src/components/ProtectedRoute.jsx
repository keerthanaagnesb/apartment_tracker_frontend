import { Navigate } from 'react-router-dom';
import { HOME, Session } from '../api';

/** Only lets a logged-in user (optionally with a specific role) see the page. */
export default function ProtectedRoute({ role, children }) {
  const user = Session.user();
  if (!Session.token() || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return children;
}
