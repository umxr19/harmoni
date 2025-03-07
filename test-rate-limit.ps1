$env:NODE_ENV = "development"

# First register a test user
Write-Host "Registering test user..."
$registerBody = @{
    email = "test2@example.com"
    password = "password123"
    username = "testuser2"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    Write-Host "Registration successful"
} catch {
    Write-Host "Registration failed with status code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error details: $($_.ErrorDetails.Message)"
    exit 1
}

# Login to get token
Write-Host "Logging in..."
$loginBody = @{
    email = "test2@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.token
    Write-Host "Token received: $($token.Substring(0, 20))..."
} catch {
    Write-Host "Login failed with status code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error details: $($_.ErrorDetails.Message)"
    exit 1
}

# Function to make test rate limit request
function Test-RateLimit {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/debug/test-rate-limit" `
            -Method Post `
            -ContentType "application/json" `
            -Headers @{
                "Authorization" = "Bearer $token"
            }
        Write-Host "Response: $($response | ConvertTo-Json -Depth 10)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        if ($statusCode -eq 429) {
            Write-Host "Rate limit hit! Status code: $statusCode"
            Write-Host "Error details: $errorBody"
        } else {
            Write-Host "Error occurred! Status code: $statusCode"
            Write-Host "Error details: $errorBody"
        }
    }
}

# Make 4 requests (should hit rate limit on 4th)
Write-Host "`nMaking request 1..."
Test-RateLimit
Start-Sleep -Seconds 1

Write-Host "`nMaking request 2..."
Test-RateLimit
Start-Sleep -Seconds 1

Write-Host "`nMaking request 3..."
Test-RateLimit
Start-Sleep -Seconds 1

Write-Host "`nMaking request 4 (should be rate limited)..."
Test-RateLimit
