$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$jsonContent = [System.IO.File]::ReadAllText('C:\DhanWin Website\emojis.json', $utf8NoBom)
$emojiObj = $jsonContent | ConvertFrom-Json

$svgCache = @{}

function Get-LucideSvg($icon) {
    if ($svgCache.ContainsKey($icon)) { return $svgCache[$icon] }
    $url = "https://unpkg.com/lucide-static@latest/icons/$icon.svg"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $svg = $response.Content
        $svg = $svg -replace '<svg', '<svg class="lucide-icon" style="width:1.2em; height:1.2em; vertical-align:-0.15em; margin-right:4px;"'
        $svgCache[$icon] = $svg
        return $svg
    } catch {
        Write-Host "Failed to fetch $icon"
        return $null
    }
}

$files = Get-ChildItem -Path 'C:\DhanWin Website\public' -Recurse -Include *.html,*.js
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    $changed = $false
    foreach ($prop in $emojiObj.psobject.properties) {
        $key = $prop.Name
        if ($content.Contains($key)) {
            $svg = Get-LucideSvg $prop.Value
            if ($svg) {
                $content = $content.Replace($key, $svg)
                $changed = $true
            }
        }
    }
    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Updated $($file.FullName)"
    }
}
Write-Host "Done"
