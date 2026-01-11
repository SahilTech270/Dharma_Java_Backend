# Simple API Verification Script

$BaseUrl = "http://localhost:8080"

Write-Host "Checking API Health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/" -Method Get
    Write-Host "Success! API is running." -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor Gray
} catch {
    Write-Host "Failed to connect to $BaseUrl/. Is the application running?" -ForegroundColor Red
    exit
}

Write-Host "`nChecking Swagger UI..." -ForegroundColor Cyan
try {
    $request = Invoke-WebRequest -Uri "$BaseUrl/swagger-ui/index.html" -Method Head
    if ($request.StatusCode -eq 200) {
        Write-Host "Swagger UI is accessible at $BaseUrl/swagger-ui/index.html" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not access Swagger UI." -ForegroundColor Yellow
}

Write-Host "`nGetting All Bookings..." -ForegroundColor Cyan
try {
    $bookings = Invoke-RestMethod -Uri "$BaseUrl/bookings/" -Method Get
    Write-Host "Success. Found $(@($bookings).Count) bookings." -ForegroundColor Green
} catch {
    Write-Host "Failed to fetch bookings: $_" -ForegroundColor Red
}
