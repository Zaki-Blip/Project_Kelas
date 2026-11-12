Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot "..\public\seed"
$thumbDir = Join-Path $root "thumbnails"
$shotDir = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $thumbDir | Out-Null
New-Item -ItemType Directory -Force -Path $shotDir | Out-Null

$projects = @(
  @{ Slug = "kasirkita"; Title = "KasirKita"; Category = "Web App"; Color = "#2F5BFF"; Text = "#FFFFFF" },
  @{ Slug = "ecotrack"; Title = "EcoTrack"; Category = "Web App"; Color = "#FFD83D"; Text = "#111111" },
  @{ Slug = "mathquest"; Title = "MathQuest"; Category = "Game"; Color = "#111111"; Text = "#FFFFFF" },
  @{ Slug = "absensi-qr"; Title = "AbsensiQR"; Category = "Web App"; Color = "#2F5BFF"; Text = "#FFFFFF" },
  @{ Slug = "tanamanku"; Title = "Tanamanku"; Category = "IoT"; Color = "#FFD83D"; Text = "#111111" },
  @{ Slug = "bukukita"; Title = "BukuKita"; Category = "Web App"; Color = "#FFFFFF"; Text = "#111111" },
  @{ Slug = "senyumsehat"; Title = "SenyumSehat"; Category = "Mobile Web"; Color = "#FFD83D"; Text = "#111111" },
  @{ Slug = "datacuaca"; Title = "DataCuaca"; Category = "Data & AI"; Color = "#2F5BFF"; Text = "#FFFFFF" },
  @{ Slug = "jejakkarbon"; Title = "JejakKarbon"; Category = "Web App"; Color = "#FFFFFF"; Text = "#111111" },
  @{ Slug = "quizkelas"; Title = "QuizKelas"; Category = "Game"; Color = "#111111"; Text = "#FFFFFF" }
)

function New-Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen([string]$hex, [float]$width) {
  return New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($hex), $width)
}

function Draw-WrappedText($graphics, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$maxWidth, [float]$lineHeight) {
  $words = $text.Split(" ")
  $line = ""
  $currentY = $y
  foreach ($word in $words) {
    $candidate = if ($line.Length -eq 0) { $word } else { "$line $word" }
    $size = $graphics.MeasureString($candidate, $font)
    if ($size.Width -gt $maxWidth -and $line.Length -gt 0) {
      $graphics.DrawString($line, $font, $brush, $x, $currentY)
      $line = $word
      $currentY += $lineHeight
    } else {
      $line = $candidate
    }
  }
  if ($line.Length -gt 0) {
    $graphics.DrawString($line, $font, $brush, $x, $currentY)
  }
}

function New-Thumbnail($project) {
  $width = 1200
  $height = 750
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bg = New-Brush "#FAF7F0"
  $ink = New-Brush "#111111"
  $white = New-Brush "#FFFFFF"
  $yellow = New-Brush "#FFD83D"
  $blue = New-Brush "#2F5BFF"
  $accent = New-Brush $project.Color
  $accentText = New-Brush $project.Text
  $border = New-Pen "#111111" 12
  $thinBorder = New-Pen "#111111" 6

  $graphics.FillRectangle($bg, 0, 0, $width, $height)
  $graphics.DrawRectangle($border, 6, 6, $width - 12, $height - 12)

  $labelFont = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font("Segoe UI", 68, [System.Drawing.FontStyle]::Bold)
  $smallFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Regular)
  $badgeFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

  $graphics.DrawString("KARYAKELAS / PROJECT SHOWCASE", $labelFont, $ink, 84, 68)

  $graphics.FillRectangle($yellow, 84, 132, 220, 52)
  $graphics.DrawRectangle($thinBorder, 84, 132, 220, 52)
  $graphics.DrawString($project.Category.ToUpper(), $badgeFont, $ink, 102, 143)

  Draw-WrappedText $graphics $project.Title $titleFont $ink 84 250 620 86

  $graphics.DrawString("Karya siswa, dibangun untuk dipakai.", $smallFont, $ink, 88, 500)

  $graphics.FillRectangle($ink, 760, 150, 356, 430)
  $graphics.FillRectangle($accent, 748, 138, 356, 430)
  $graphics.DrawRectangle($thinBorder, 748, 138, 356, 430)

  $graphics.FillRectangle($white, 790, 190, 272, 120)
  $graphics.DrawRectangle($thinBorder, 790, 190, 272, 120)
  $graphics.DrawString("LIVE PREVIEW", $badgeFont, $ink, 812, 222)

  $graphics.FillRectangle($yellow, 790, 340, 120, 120)
  $graphics.DrawRectangle($thinBorder, 790, 340, 120, 120)
  $graphics.FillRectangle($blue, 930, 340, 132, 120)
  $graphics.DrawRectangle($thinBorder, 930, 340, 132, 120)

  $graphics.FillRectangle($accent, 790, 490, 272, 28)
  $graphics.FillRectangle($accent, 790, 530, 200, 18)

  $graphics.DrawString("2026 / XII RPL 1", $smallFont, $ink, 84, 650)

  $path = Join-Path $thumbDir "$($project.Slug).png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bitmap.Dispose()
  $bg.Dispose(); $ink.Dispose(); $white.Dispose(); $yellow.Dispose(); $blue.Dispose(); $accent.Dispose(); $accentText.Dispose()
  $border.Dispose(); $thinBorder.Dispose(); $labelFont.Dispose(); $titleFont.Dispose(); $smallFont.Dispose(); $badgeFont.Dispose()
}

function New-Screenshot($project, [int]$index) {
  $width = 1200
  $height = 750
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bg = New-Brush "#FAF7F0"
  $surface = New-Brush "#FFFFFF"
  $ink = New-Brush "#111111"
  $blue = New-Brush "#2F5BFF"
  $yellow = New-Brush "#FFD83D"
  $border = New-Pen "#111111" 10
  $thin = New-Pen "#111111" 4

  $graphics.FillRectangle($bg, 0, 0, $width, $height)
  $graphics.DrawRectangle($border, 5, 5, $width - 10, $height - 10)

  $graphics.FillRectangle($ink, 40, 40, $width - 80, 54)
  $graphics.FillRectangle($yellow, 58, 56, 22, 22)
  $graphics.FillRectangle($blue, 92, 56, 22, 22)
  $graphics.FillRectangle($surface, 126, 56, 22, 22)

  $urlFont = New-Object System.Drawing.Font("Consolas", 16, [System.Drawing.FontStyle]::Regular)
  $graphics.DrawString("https://$($project.Slug).vercel.app", $urlFont, $surface, 190, 57)

  $navFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
  $headFont = New-Object System.Drawing.Font("Segoe UI", 38, [System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)

  $graphics.FillRectangle($surface, 40, 120, 260, 570)
  $graphics.DrawRectangle($thin, 40, 120, 260, 570)
  $graphics.DrawString("KaryaKelas", $navFont, $ink, 64, 150)
  $graphics.DrawString("Dashboard", $bodyFont, $ink, 64, 220)
  $graphics.DrawString("Projects", $bodyFont, $ink, 64, 260)
  $graphics.DrawString("Team", $bodyFont, $ink, 64, 300)
  $graphics.DrawString("Settings", $bodyFont, $ink, 64, 340)

  $graphics.FillRectangle($blue, 330, 120, 830, 130)
  $graphics.DrawRectangle($thin, 330, 120, 830, 130)
  $graphics.DrawString($project.Title, $headFont, $surface, 366, 150)
  $graphics.DrawString("Screenshot $index / demo interface", $bodyFont, $surface, 368, 205)

  $graphics.FillRectangle($surface, 330, 280, 250, 180)
  $graphics.DrawRectangle($thin, 330, 280, 250, 180)
  $graphics.FillRectangle($yellow, 360, 310, 80, 18)
  $graphics.FillRectangle($ink, 360, 350, 170, 12)
  $graphics.FillRectangle($ink, 360, 378, 120, 12)

  $graphics.FillRectangle($surface, 610, 280, 250, 180)
  $graphics.DrawRectangle($thin, 610, 280, 250, 180)
  $graphics.FillRectangle($blue, 640, 310, 80, 18)
  $graphics.FillRectangle($ink, 640, 350, 170, 12)
  $graphics.FillRectangle($ink, 640, 378, 140, 12)

  $graphics.FillRectangle($surface, 890, 280, 270, 180)
  $graphics.DrawRectangle($thin, 890, 280, 270, 180)
  $graphics.FillRectangle($yellow, 920, 310, 80, 18)
  $graphics.FillRectangle($ink, 920, 350, 190, 12)
  $graphics.FillRectangle($ink, 920, 378, 110, 12)

  $graphics.FillRectangle($surface, 330, 490, 830, 200)
  $graphics.DrawRectangle($thin, 330, 490, 830, 200)
  $graphics.DrawString("Ringkasan project", $navFont, $ink, 366, 520)
  $graphics.DrawString("Data demo untuk katalog KaryaKelas. Konten ini bukan data produksi.", $bodyFont, $ink, 366, 570)
  $graphics.DrawString("Teknologi, anggota tim, dan tautan preview dikelola oleh admin.", $bodyFont, $ink, 366, 606)
  $graphics.FillRectangle($yellow, 366, 646, 120, 16)
  $graphics.FillRectangle($blue, 500, 646, 180, 16)

  $path = Join-Path $shotDir "$($project.Slug)-$index.png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bitmap.Dispose()
  $bg.Dispose(); $surface.Dispose(); $ink.Dispose(); $blue.Dispose(); $yellow.Dispose()
  $border.Dispose(); $thin.Dispose(); $urlFont.Dispose(); $navFont.Dispose(); $headFont.Dispose(); $bodyFont.Dispose()
}

foreach ($project in $projects) {
  New-Thumbnail $project
  if ($project.Slug -ne "quizkelas") {
    New-Screenshot $project 1
    New-Screenshot $project 2
  }
}

Write-Output "Seed images generated in $root"
