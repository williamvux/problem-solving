# Problem 5 — Tasks & Projects CRUD API

ExpressJS + TypeScript CRUD service backed by SQLite.

This is just a simple project. So I don't want to overuse architecture. But I still use DI for future update and maintain.

## Prerequisites

- Node.js >= 18

## Setup

Install dependencies:

```bash
npm install
```

(Optional, but no need, because I already config data. We must not upload ENV to github but because It contains no sensitive data and just for demo project so that I still push it) Copy `.env.example` to `.env` to override defaults:

```bash
cp .env.example .env
```

| Variable  | Default            |
| --------- | ------------------ |
| `PORT`    | `3000`             |
| `DB_PATH` | `./data/tasks.db`  |

The SQLite file and its directory are created automatically on first
start.

## Run

I also push my database file in data/
If you want to setup from scratch. just delete the data/

Development (auto-reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Once running:

- API base: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- Health: `http://localhost:3000/health`

