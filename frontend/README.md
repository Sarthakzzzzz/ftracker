# Finance Dashboard Frontend

This is the Next.js UI for the `ftracker` backend.

## Features

- Public home/portfolio landing page
- Dashboard summary with charts and KPIs
- Transactions, categories, and users screens
- Sign-in flow against the FastAPI backend
- Role-aware navigation
- Dark mode support

## API Base URL

The frontend reads the backend URL from:

```bash
NEXT_PUBLIC_API_BASE_URL
```

Default:

```bash
http://localhost:8000/api/v1
```

Set this to the public backend URL before building the app in production.

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

Routes:

- `/` public home page
- `/dashboard` authenticated finance dashboard
- `/signin` login page

## Production Build

```bash
npm run build
npm run start
```

For a containerized deployment, use the root `docker-compose.yml`.
