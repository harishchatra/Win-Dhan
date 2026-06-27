$emojiMap = @{
    '⚡' = 'zap'
    '☀️' = 'sun'
    '🔋' = 'battery'
    '🚢' = 'ship'
    '🎓' = 'graduation-cap'
    '🔬' = 'microscope'
    '🏫' = 'school'
    '📞' = 'phone'
    '✉️' = 'mail'
    '🌐' = 'globe'
    '📍' = 'map-pin'
    '🏛️' = 'landmark'
    '🏪' = 'store'
    '⭐' = 'star'
    '📂' = 'folder'
    '👥' = 'users'
    '👤' = 'user'
    '🤝' = 'handshake'
    '💳' = 'credit-card'
    '🏆' = 'trophy'
    '📋' = 'clipboard'
    '📅' = 'calendar'
    '📢' = 'megaphone'
    '🖨️' = 'printer'
    '⚙️' = 'settings'
    '🚪' = 'door-open'
    '🔍' = 'search'
    '🔔' = 'bell'
    '📊' = 'bar-chart'
    '🗺️' = 'map'
    '🛠️' = 'wrench'
    '➕' = 'plus'
    '➖' = 'minus'
    '⟲' = 'rotate-ccw'
    '🇮🇳' = 'map-pin'
    '🇦🇪' = 'map-pin'
    '🇸🇦' = 'map-pin'
    '🇩🇪' = 'map-pin'
    '🇩🇰' = 'map-pin'
    '🇨🇳' = 'map-pin'
    '🇯🇵' = 'map-pin'
    '🇸🇬' = 'map-pin'
    '🇰🇪' = 'map-pin'
    '🇧🇷' = 'map-pin'
}

$svgCache = @{}

function Get-LucideSvg($icon) {
    if ($svgCache.ContainsKey($icon)) { return $svgCache[$icon] }
    $url = "https://unpkg.com/lucide-static@latest/icons/$icon.svg"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $svg = $response.Content
        $svg = $svg -replace '<svg', '<svg class="lucide-icon" style="width:1em; height:1em; vertical-align:-0.125em; margin-right:4px;"'
        $svgCache[$icon] = $svg
        return $svg
    } catch {
        Write-Host "Failed to fetch $icon"
        return $null
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$files = Get-ChildItem -Path 'C:\DhanWin Website\public' -Recurse -Include *.html,*.js
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    $changed = $false
    foreach ($key in $emojiMap.Keys) {
        if ($content.Contains($key)) {
            $svg = Get-LucideSvg $emojiMap[$key]
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
