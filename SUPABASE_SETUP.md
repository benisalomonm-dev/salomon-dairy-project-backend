# Supabase PostgreSQL Setup

## Database Migration

This backend has been migrated from SQLite to **Supabase PostgreSQL**.

## Environment Variables

Make sure to set the following environment variables:

```bash
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.pckhbpzkxitdaumuznyl.supabase.co:5432/postgres
SUPABASE_URL=https://pckhbpzkxitdaumuznyl.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_quXXh7OLYhqnzezgjK7zBw_xtLB4TAw
DB_SYNC=true
DB_ALTER=false
```

## Supabase Credentials

- **Connection String**: `postgresql://postgres:[YOUR-PASSWORD]@db.pckhbpzkxitdaumuznyl.supabase.co:5432/postgres`
- **Public URL**: `https://pckhbpzkxitdaumuznyl.supabase.co`
- **Publishable Key**: `sb_publishable_quXXh7OLYhqnzezgjK7zBw_xtLB4TAw`

## Running the Backend

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Initialization

On first run with `DB_SYNC=true`, the backend will automatically:
- Connect to Supabase PostgreSQL
- Create all required tables
- Sync the database schema

## Key Changes from SQLite

1. **Dialect**: Changed from `sqlite` to `postgres`
2. **Connection**: Using connection string instead of file path
3. **SSL**: Enabled SSL for secure Supabase connection
4. **Connection Pooling**: Added connection pool configuration
5. **Dependencies**: Added `pg` and `pg-hstore` packages

## Deployment Notes

When deploying to platforms like Railway, Render, or Heroku:
- Set the `DATABASE_URL` environment variable
- Set `NODE_ENV=production`
- Set `DB_SYNC=true` for initial deployment (then set to `false` after)
- Make sure SSL is enabled for Supabase connection
