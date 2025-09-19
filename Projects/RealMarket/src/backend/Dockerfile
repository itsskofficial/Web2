# src/backend/Dockerfile
# Stage 1: Builder - Install dependencies
# This stage installs dependencies into a wheelhouse, which is more efficient.
FROM python:3.11-slim AS builder

WORKDIR /app

# Set environment variables to prevent Python from writing .pyc files and to buffer output
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy only the requirements file to leverage Docker's layer caching
COPY requirements.txt .

# Install dependencies into a /wheels directory
# This is faster and more cacheable than a direct pip install.
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# Stage 2: Final image - Assemble the application
FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
# - postgresql-client is needed for the pg_isready command in the entrypoint script.
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy installed packages from the builder stage and install them
COPY --from=builder /wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy the application code into the container
COPY . .

# Copy and set executable permissions for the entrypoint script
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["/app/entrypoint.sh"]

# The default command to run the application, passed to the entrypoint script.
# Using 4 workers is a good starting point for a production-like environment.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "4"]