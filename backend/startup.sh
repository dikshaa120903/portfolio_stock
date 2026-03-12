#!/bin/bash
# startup.sh for Azure App Service (Linux)

echo "Starting deployment script for Linux App Service..."
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Starting Gunicorn on port 8000..."
gunicorn --bind=0.0.0.0:8000 --timeout 600 config.wsgi:application
