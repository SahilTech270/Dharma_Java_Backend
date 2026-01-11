Write-Host "Setting up environment..."
Set-Location "$PSScriptRoot\DHARMA-BOOKING-BACKENDv2"

Write-Host "Attempting to start database..."
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Docker command failed. Please ensure Docker Desktop is running."
}

Write-Host "Starting Uvicorn Server..."
uvicorn main:app --reload
