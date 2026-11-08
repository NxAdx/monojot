Add-Type -AssemblyName System.Drawing

function Create-RoundedRectanglePath ($x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Generate-Icon ($path, $size, $isTransparentBg) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($isTransparentBg) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    }

    $scale = $size / 1024.0

    # Brushes
    $blackBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 17, 17, 19))
    $grayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 224, 224, 230))
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))

    # 1. Cursor line: (240, 310, 16, 110, rx 8)
    $cursorPath = Create-RoundedRectanglePath (240 * $scale) (310 * $scale) (16 * $scale) (110 * $scale) (8 * $scale)
    $g.FillPath($blackBrush, $cursorPath)

    # 2. Placeholder line: (280, 345, 310, 40, rx 20)
    $placeholderPath = Create-RoundedRectanglePath (280 * $scale) (345 * $scale) (310 * $scale) (40 * $scale) (20 * $scale)
    $g.FillPath($grayBrush, $placeholderPath)

    # 3. Done Pill: (212, 590, 600, 150, rx 75)
    $pillPath = Create-RoundedRectanglePath (212 * $scale) (590 * $scale) (600 * $scale) (150 * $scale) (75 * $scale)
    $g.FillPath($blackBrush, $pillPath)

    # 4. Pill Dash: (472, 660, 80, 12, rx 6)
    $dashPath = Create-RoundedRectanglePath (472 * $scale) (660 * $scale) (80 * $scale) (12 * $scale) (6 * $scale)
    $g.FillPath($whiteBrush, $dashPath)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $path"
}

Generate-Icon "assets/icon.png" 1024 $false
Generate-Icon "assets/adaptive-icon.png" 1024 $true
Generate-Icon "assets/splash.png" 1024 $false
Generate-Icon "assets/favicon.png" 48 $false
