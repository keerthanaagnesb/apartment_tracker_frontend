# Apartment Community Issue Tracker — Frontend

React 18 · React Router · Vite (Node.js) · SockJS + STOMP for live updates

Three role-based dashboards (resident, admin, technician) and a community chat.
It talks to the Spring Boot REST API in the separate `apartment-tracker-backend` repository.

## Run
Needs Node.js 18+ and the backend running on http://localhost:8080.
```bash
npm install     # first time only
npm run dev
```
Open **http://localhost:5173**.

If your backend is on a different address, copy `.env.example` to `.env` and set `VITE_API_BASE`.

## Demo accounts (password: `password123`)
admin@apartment.com · tech.electric@apartment.com · tech.plumber@apartment.com · resident1@apartment.com

## Structure
```
src/
├── api.js               login session (per tab) + fetch wrapper that adds the JWT
├── App.jsx              routes
├── components/          Navbar, Layout, ProtectedRoute, Stat, StatusBadge, StatusForm, Toast
├── hooks/useLive.js     WebSocket live updates
├── pages/               Login, Register, Resident, Admin, Technician, Chat
└── styles/style.css     role themes + animations
```
Each browser tab keeps its own login (`sessionStorage`), so you can be admin, resident and technician in different tabs.
