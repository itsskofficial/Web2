#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# A simple loop to wait for the database to be ready.
# For production, a more robust tool like wait-for-it.sh is recommended.
echo "Waiting for PostgreSQL to start..."
while ! pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -q; do
  sleep 1
done
echo "PostgreSQL started successfully."

# Run database migrations using Alembic.
echo "Running database migrations..."
alembic upgrade head
echo "Database migrations complete."

# Start the application server (exec passes control to the new process).
echo "Starting application server..."
exec "$@"