# Library Management System

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL *or* SQLite (for backend DB)
- npm & pip installed

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
```

Backend requires a running database (PostgreSQL on localhost:5432 via DATABASE_URL in .env, or SQLite for local dev).

### Gateway
```bash
cd gateway
npm install
```

Gateway requires:
* Node.js
* Installed `node_modules`
* Backend gRPC service running

### Frontend
```bash
cd frontend
npm install
```

## Run All Services
From project root:
```powershell
.\start-all.ps1
```

This starts:
* Backend (gRPC + DB)
* Gateway (Node + Express)
* Frontend (React/Vite)

## Architecture
- *Backend*: Python gRPC service with PostgreSQL/SQLite
- *Gateway*: Node.js REST API (gRPC client)
- *Frontend*: React + Vite

## Notes
- Ensure PostgreSQL is running if not using SQLite
- Default ports: Backend (gRPC), Gateway (Express), Frontend (Vite dev server)
- Configure environment variables in .env files as needed
