# build_for_azure.ps1
Write-Host "Starting Azure Build Preparation..."

# 1. Build Frontend
Write-Host "Building React Frontend..."
Set-Location -Path "..\frontend"
npm install
npm run build

# 2. Collect Static Files
Write-Host "Collecting Static Files in Django..."
Set-Location -Path "..\backend"
.\venv\Scripts\activate
python manage.py collectstatic --noinput

Write-Host "Build Complete! Ready for App Service push."
