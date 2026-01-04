#!/bin/bash
# Database initialization script for Railway deployment
# This runs automatically when the backend starts

set -e

echo "🔧 Starting database initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=0

until mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SELECT 1" > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database connection failed after $max_attempts attempts"
    exit 1
  fi
  echo "   Attempt $attempt/$max_attempts - waiting for MySQL..."
  sleep 2
done

echo "✅ Database connection established!"

# Check if tables exist
table_count=$(mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -s -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_NAME}'")

if [ "$table_count" -eq 0 ]; then
  echo "📊 No tables found. Running schema.sql..."
  
  if [ -f /app/database/schema.sql ]; then
    mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < /app/database/schema.sql
    echo "✅ Database schema created successfully!"
    echo "✅ Default admin user created: admin@dairysystem.com / admin123"
  else
    echo "⚠️  Warning: schema.sql not found at /app/database/schema.sql"
  fi
else
  echo "✅ Database already initialized ($table_count tables found)"
fi

echo "🚀 Starting application..."
exec node dist/server.js
