#!/bin/sh
set -e

# Run composer install if vendor directory is missing or composer.lock has changed
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "Running composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-progress
else
    echo "Vendor directory exists, skipping composer install..."
fi

# Set up .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "Generating application key..."
    php artisan key:generate --no-interaction
fi

# Clear and cache configurations to ensure latest .env is used
echo "Clearing cached configuration..."
php artisan config:clear

# Wait for the database to be ready (Using Laravel DB connection check)
echo "Waiting for database connection..."
MAX_TRIES=30
TRIES=0
while [ $TRIES -lt $MAX_TRIES ]; do
  # Check if DB is accessible by attempting to get the database name
  if php artisan db:show > /dev/null 2>&1; then
    echo "Database is up!"
    break
  fi
  
  # Fallback to PDO ping in case db:show is not available or errors out weirdly
  if php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }" > /dev/null 2>&1; then
      echo "Database is up (via PDO check)!"
      break
  fi

  echo "Database is unavailable - sleeping 2s..."
  sleep 2
  TRIES=$((TRIES+1))
done

if [ $TRIES -eq $MAX_TRIES ]; then
  echo "Error: Database connection timed out."
  exit 1
fi

echo "Caching configuration..."
php artisan config:cache

# Run migrations and seeders
echo "Running migrations..."
php artisan migrate --force --seed

echo "Starting PHP-FPM..."
exec "$@"
