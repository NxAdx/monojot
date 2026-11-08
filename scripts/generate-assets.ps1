# D:\Production\monojot\scripts\generate-assets.ps1
Add-Type -AssemblyName System.Drawing

$assetsDir = "D:\Production\monojot\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

function Create-MonoJotIcon {
    param(
        [int]$Width,
        [int]$Height,
        [string]$OutputPath,
        [bool]$IsSplash = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background: Pure OLED Black #000000
    $blackBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 0, 0, 0))
    $g.FillRectangle($blackBrush, 0, 0, $Width, $Height)

    # Calculate center glyph bounds
    $scale = if ($IsSplash) { 0.25 } else { 0.55 }
    $glyphSize = [int]($Width * $scale)
    $x = ($Width - $glyphSize) / 2
    $y = ($Height - $glyphSize) / 2

    # White brush and pen
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $charcoalBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 17, 17, 19))
    
    # Outer Card / Squircle: Rounded Rectangle
    $cardRadius = [int]($glyphSize * 0.24)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $cardRadius * 2

    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $glyphSize - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $glyphSize - $diameter, $y + $glyphSize - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $glyphSize - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    # Fill White Squircle Card
    $g.FillPath($whiteBrush, $path)

    # Inside Card: Draw Minimalist Jot Symbol
    # A crisp brutalist black horizontal bar and a focus dot
    $barWidth = [int]($glyphSize * 0.45)
    $barHeight = [int]($glyphSize * 0.08)
    $barX = $x + [int](($glyphSize - $barWidth) / 2)
    $barY = $y + [int]($glyphSize * 0.38)
    $g.FillRectangle($charcoalBrush, $barX, $barY, $barWidth, $barHeight)

    # Second line: shorter note line
    $line2Width = [int]($glyphSize * 0.28)
    $line2X = $barX
    $line2Y = $barY + [int]($glyphSize * 0.16)
    $g.FillRectangle($charcoalBrush, $line2X, $line2Y, $line2Width, $barHeight)

    # A radical focus dot on the second line
    $dotRadius = [int]($barHeight * 0.7)
    $dotX = $barX + $barWidth - ($dotRadius * 2)
    $dotY = $line2Y - [int]($dotRadius * 0.3)
    $g.FillEllipse($charcoalBrush, $dotX, $dotY, ($dotRadius * 2), ($dotRadius * 2))

    # If splash screen, also render the crisp "MonoJot" typography below
    if ($IsSplash) {
        $font = New-Object System.Drawing.Font ("Arial", [float]($Width * 0.04), [System.Drawing.FontStyle]::Bold)
        $stringFormat = New-Object System.Drawing.StringFormat
        $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $textY = $y + $glyphSize + [int]($Height * 0.04)
        $g.DrawString("MonoJot", $font, $whiteBrush, [float]($Width / 2), [float]$textY, $stringFormat)
    }

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $OutputPath ($Width x $Height)"
}

Create-MonoJotIcon -Width 1024 -Height 1024 -OutputPath "$assetsDir\icon.png"
Create-MonoJotIcon -Width 1024 -Height 1024 -OutputPath "$assetsDir\adaptive-icon.png"
Create-MonoJotIcon -Width 2048 -Height 2048 -OutputPath "$assetsDir\splash.png" -IsSplash $true
Create-MonoJotIcon -Width 48 -Height 48 -OutputPath "$assetsDir\favicon.png"

