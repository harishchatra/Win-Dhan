$files = Get-ChildItem -Path 'C:\DhanWin Website\public' -Recurse -Include *.html
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match '<img(?![^>]*loading=)') {
        $content = $content -replace '<img(?![^>]*loading=)', '<img loading="lazy" decoding="async"'
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}
