import { API_BASE } from './config';

// ---------- Session: kept in sessionStorage, so it is private to THIS browser tab ----------
export const Session = {
  save(token, user) {
    sessionStorage.setItem('apt_token', token);
    sessionStorage.setItem('apt_user', JSON.stringify(user));
  },
  token() { return sessionStorage.getItem('apt_token'); },
  user() {
    try { return JSON.parse(sessionStorage.getItem('apt_user')); } catch (e) { return null; }
  },
  clear() { sessionStorage.removeItem('apt_token'); sessionStorage.removeItem('apt_user'); }
};

export const HOME = { RESIDENT: '/resident/dashboard', ADMIN: '/admin/dashboard', TECHNICIAN: '/technician' };

// ---------- API wrapper: adds the JWT to every request ----------
export const API = {
  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Session.token();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch (e) {
      throw new Error('Cannot reach the server. Is the backend running at ' + API_BASE + ' ?');
    }
    if (res.status === 401 && token) {            // token expired or invalid
      Session.clear();
      window.location.replace('/login?expired=1');
      throw new Error('Session expired. Please sign in again.');
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { /* not JSON */ }
    if (!res.ok) throw new Error((data && data.message) || ('Request failed (' + res.status + ')'));
    return data;
  },
  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body || {}); }
};

export const ISSUE_TYPES = [
  ['WATER', 'Water Issue'], ['LIFT', 'Lift Issue'], ['PARKING', 'Parking Issue'],
  ['SECURITY', 'Security Issue'], ['GARBAGE', 'Garbage Issue'], ['ELECTRICAL', 'Electrical Issue'],
  ['COMMON_AREA', 'Common Area Damage'], ['OTHER', 'Other']
];
export const STATUS_LABEL = { PENDING: 'Pending', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' };

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB') : '');

export function themeFor(user) {
  if (user.role === 'RESIDENT') return 'theme-resident';
  if (user.role === 'ADMIN') return 'theme-admin';
  return /plumb/i.test(user.department || '') ? 'theme-tech-plumbing' : 'theme-tech-electric';
}
