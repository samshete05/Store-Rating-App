# StoreMark

StoreMark is a full-stack store rating and feedback platform built with React, Tailwind CSS, Express, and PostgreSQL. It supports role-based access for admins, normal users, and store owners, with separate dashboards for managing stores, users, ratings, and password updates.

The project includes:
- A React frontend in the repo root
- An Express backend in `backend/`
- PostgreSQL schema and seed scripts in `backend/sql/`
- `docker-compose.yml` for local database setup

## Requirements Covered

- Single login system for all roles
- Admin, normal user, and store owner dashboards
- Store creation, user creation, store listing, ratings, filtering, and sorting
- Password updates after login
- PostgreSQL schema and dummy data

## Frontend Setup

```bash
npm install
npm start
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

## Database Setup
1. Start PostgreSQL with Docker:
```bash
docker compose up -d db
```

2. Apply schema and seed:
```bash
psql -h localhost -U postgres -d store_ratings -f backend/sql/schema.sql
psql -h localhost -U postgres -d store_ratings -f backend/sql/seed.sql
```

## Dummy Logins
- Admin: `admin@storegrid.com` / `Admin@1234`
- Store owner: `owner@storegrid.com` / `Owner@1234`
- Normal user: `user@storegrid.com` / `User@1234`

## Notes
 The React app is already built as CRA, not Vite.
 The backend is ready for JWT-based auth and PostgreSQL.
 The database scripts follow the challenge rules and constraints.
