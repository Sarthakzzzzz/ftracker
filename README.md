# Finance Data Processing and Access Control Backend

FTracker is a full-stack finance dashboard project built to demonstrate backend architecture, role-based access control, financial record processing, and dashboard analytics.

The backend is implemented with FastAPI, SQLModel, PostgreSQL, and Alembic. The frontend is a Next.js dashboard customized for this project with a public landing page, authenticated dashboard, and role-aware navigation.

## What This Project Covers

- User and role management
- Active/inactive user status
- Transaction and category CRUD
- Filtering by date, category, and type
- Dashboard summary APIs
- Role-based access control
- Input validation and error handling
- PostgreSQL persistence
- Demo seed data via Alembic
- Production-friendly Docker deployment

## Stack

- Backend: FastAPI, SQLModel, SQLAlchemy, Alembic, PostgreSQL
- Auth: custom signed tokens with PBKDF2 password hashing
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, ApexCharts
- Deployment: Docker Compose

## Roles

- `viewer`: can view dashboard data and records
- `analyst`: can view records and summaries
- `admin`: can manage users, categories, and transactions

## Main Features

### User and Role Management

- Create, update, list, and delete users
- Manage active/inactive status
- Assign roles
- Restrict admin-only operations on the backend

### Financial Records

- Create, update, read, and delete transactions
- Filter records by:
  - date range
  - category
  - transaction type
- Validate amounts, date ranges, and category/type consistency

### Dashboard Analytics

- Total income
- Total expense
- Net balance
- Category totals
- Recent activity
- Monthly and weekly trends

### Access Control

- Token-based authentication
- Reusable role guards in backend dependencies
- Role-aware frontend navigation and route protection

### Validation and Reliability

- Pydantic/SQLModel validation
- HTTP errors for invalid input and invalid operations
- Safe handling of inactive users and missing resources

## Project Structure

```text
ftracker/
├── alembic/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── crud/
│       ├── db/
│       ├── models/
│       └── services/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── icons/
│       ├── layout/
│       ├── lib/
│       └── types/
├── main.py
├── docker-compose.yml
├── .env.example
└── LICENSE
```

## Environment Variables

### Root `.env`

Copy from `.env.example` and update for your environment.

Important values:

- `DATABASE_URL`
- `SECRET_KEY`
- `FRONTEND_HOST`
- `BACKEND_CORS_ORIGINS`
- `FIRST_SUPERUSER_EMAIL`
- `FIRST_SUPERUSER_PASSWORD`

### Frontend `.env.local`

Set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Change it to your deployed backend URL in production.

## Local Development

### 1. Install dependencies

```bash
uv sync
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
cd frontend
cp .env.example .env.local
```

### 3. Prepare the database

Create a PostgreSQL database named `finance_dashboard` or update `DATABASE_URL` to match your setup.

### 4. Apply migrations and seed data

From the project root:

```bash
uv run alembic upgrade head
```

### 5. Run the backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Backend docs:

- `http://127.0.0.1:8000/docs`

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend:

- `http://localhost:3000`

## Deployment

You can deploy the two apps separately:

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend/`.
3. Add this environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend-url>/api/v1
```

4. Deploy the project.

### Backend on Render

1. Create a new Render Web Service.
2. Point it at this repository and use the root-level `backend/Dockerfile`.
3. Add the required environment variables:

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:5432/<database>
SECRET_KEY=<strong-random-secret>
FRONTEND_HOST=https://<your-vercel-frontend-url>
BACKEND_CORS_ORIGINS=https://<your-vercel-frontend-url>
FIRST_SUPERUSER_EMAIL=admin@example.com
FIRST_SUPERUSER_PASSWORD=adminadmin
```

4. Make sure your Render Postgres database is created and the `DATABASE_URL` points to it.
5. Deploy the service.

The backend container runs Alembic automatically on startup, so schema and seed data are applied inside the container.

### Local Docker deployment

If you want to test the full stack locally with Docker:

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- FastAPI backend on `http://localhost:8000`
- Next.js frontend on `http://localhost:3000`

## Routes

### Public

- `/` public home / portfolio page
- `/signin` sign-in page

### Authenticated frontend routes

- `/dashboard` dashboard preview or live dashboard
- `/transactions`
- `/categories`
- `/users`

### Backend API

- `GET /api/v1/health/`
- `POST /api/v1/login/access-token`
- `POST /api/v1/login/test-token`
- `GET /api/v1/users/`
- `POST /api/v1/users/`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`
- `GET /api/v1/categories/`
- `POST /api/v1/categories/`
- `PATCH /api/v1/categories/{category_id}`
- `DELETE /api/v1/categories/{category_id}`
- `GET /api/v1/transactions/`
- `POST /api/v1/transactions/`
- `PATCH /api/v1/transactions/{transaction_id}`
- `DELETE /api/v1/transactions/{transaction_id}`
- `GET /api/v1/dashboard/summary`

## Demo Access

The seed migration creates demo users and data for charts and dashboard testing.

If you want to change the default admin credentials, update the root `.env` values before running the seed migration.

## Notes

- The project intentionally favors clarity and maintainability over complex abstractions.
- Production deployments should set `ENVIRONMENT=production`.
- If you are deploying outside Docker, run Alembic before starting the backend.
- The frontend is configured to read the backend URL from `NEXT_PUBLIC_API_BASE_URL`.

