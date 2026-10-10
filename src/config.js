// Where the Spring Boot backend is running (override with VITE_API_BASE in a .env file).
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
