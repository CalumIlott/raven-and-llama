# Smart Local Web Server for Raven & Llama Learning (Strict UTF-8 Encoding & API Persistence)
$portsToTry = @(8080, 8081, 8082, 8085, 3000, 5000, 8000, 8888)
$folder = $PSScriptRoot
if (-not $folder) { $folder = Get-Location }
$dataDir = Join-Path $folder "data"
if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir -Force | Out-Null }
$dataFile = Join-Path $dataDir "profiles.json"

$listener = $null
$activePort = $null

foreach ($port in $portsToTry) {
    try {
        $testListener = New-Object System.Net.HttpListener
        $testListener.Prefixes.Add("http://localhost:$port/")
        $testListener.Start()
        $listener = $testListener
        $activePort = $port
        break
    } catch {
        if ($testListener) {
            $testListener.Close()
            $testListener = $null
        }
    }
}

if (-not $listener) {
    Write-Error "Could not find an open port. Please free up port 8080 or 8081 and try again."
    exit 1
}

try {
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "🪶 Raven & Llama Learning Web Server Running!" -ForegroundColor Yellow
    Write-Host "👉 URL: http://localhost:$activePort/" -ForegroundColor Green
    Write-Host "👉 Server Profile Persistence: data/profiles.json Active (UTF-8)" -ForegroundColor Magenta
    Write-Host "👉 Press Ctrl+C in this window to stop the server" -ForegroundColor Gray
    Write-Host "==================================================" -ForegroundColor Cyan

    Start-Process "http://localhost:$activePort/"

    $utf8 = [System.Text.UTF8Encoding]::new($false)

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl.Split('?')[0]

        # Handle API Endpoints for Profiles Persistence & Cross-Device Sync
        if ($rawUrl -eq "/api/profiles") {
            $response.ContentType = "application/json; charset=utf-8"
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            if ($request.HttpMethod -eq "GET") {
                if (Test-Path $dataFile) {
                    $jsonContent = [System.IO.File]::ReadAllText($dataFile, $utf8)
                } else {
                    $jsonContent = '{"profiles":[]}'
                }
                $bytes = $utf8.GetBytes($jsonContent)
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            if ($request.HttpMethod -eq "POST") {
                $reader = [System.IO.StreamReader]::new($request.InputStream, $utf8)
                $body = $reader.ReadToEnd()
                try {
                    $parsed = $body | ConvertFrom-Json
                    # Check if body is a single profile update or full state
                    if ($parsed.profile) {
                        # Load existing server data
                        $existingJson = if (Test-Path $dataFile) { [System.IO.File]::ReadAllText($dataFile, $utf8) } else { '{"profiles":[]}' }
                        $existing = $existingJson | ConvertFrom-Json
                        $profilesList = [System.Collections.ArrayList]@($existing.profiles)

                        $targetId = $parsed.profile.id
                        $foundIndex = -1
                        for ($i = 0; $i -lt $profilesList.Count; $i++) {
                            if ($profilesList[$i].id -eq $targetId) {
                                $foundIndex = $i
                                break
                            }
                        }
                        if ($foundIndex -ge 0) {
                            $profilesList[$foundIndex] = $parsed.profile
                        } else {
                            $profilesList.Add($parsed.profile) | Out-Null
                        }
                        $mergedObj = @{ profiles = $profilesList }
                        $outJson = $mergedObj | ConvertTo-Json -Depth 20 -Compress:$false
                        [System.IO.File]::WriteAllText($dataFile, $outJson, $utf8)
                    } elseif ($parsed.deleteProfileId) {
                        $existingJson = if (Test-Path $dataFile) { [System.IO.File]::ReadAllText($dataFile, $utf8) } else { '{"profiles":[]}' }
                        $existing = $existingJson | ConvertFrom-Json
                        $profilesList = [System.Collections.ArrayList]@($existing.profiles | Where-Object { $_.id -ne $parsed.deleteProfileId })
                        $mergedObj = @{ profiles = $profilesList }
                        $outJson = $mergedObj | ConvertTo-Json -Depth 20 -Compress:$false
                        [System.IO.File]::WriteAllText($dataFile, $outJson, $utf8)
                    } else {
                        # Full state update
                        [System.IO.File]::WriteAllText($dataFile, $body, $utf8)
                    }
                    $respBytes = $utf8.GetBytes('{"status":"saved"}')
                } catch {
                    [System.IO.File]::WriteAllText($dataFile, $body, $utf8)
                    $respBytes = $utf8.GetBytes('{"status":"saved"}')
                }
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.StatusCode = 200
                $response.Close()
                continue
            }
        }

        # Static File Serving
        $localFile = $rawUrl.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localFile)) { $localFile = "index.html" }
        $localPath = Join-Path $folder $localFile

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $mime
            # No-cache for JS, CSS, HTML so browsers always get fresh files
            if ($ext -in @(".js", ".css", ".html")) {
                $response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
                $response.AddHeader("Pragma", "no-cache")
                $response.AddHeader("Expires", "0")
            }
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = $utf8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
}
finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}