$tempDir = Join-Path $env:TEMP 'OrgCheckSR'
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir 'js') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir 'img') | Out-Null

Copy-Item 'build/libs/d3/d3.js' (Join-Path $tempDir 'js/d3.js')
Copy-Item 'build/libs/fflate/fflate.js' (Join-Path $tempDir 'js/fflate.js')
Copy-Item 'build/libs/jsforce/jsforce.js' (Join-Path $tempDir 'js/jsforce.js')
Copy-Item 'build/libs/sheetjs/xlsx.js' (Join-Path $tempDir 'js/xlsx.js')
Copy-Item 'build/src/img/Logo.svg' (Join-Path $tempDir 'img/Logo.svg')
Copy-Item 'build/src/img/Mascot.svg' (Join-Path $tempDir 'img/Mascot.svg')
Copy-Item 'build/src/img/Mascot+Animated.svg' (Join-Path $tempDir 'img/Mascot+Animated.svg')

$zipPath = 'force-app/main/default/staticresources/OrgCheck_SR.resource'
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipPath -Force

Write-Host 'Static resource created at:' $zipPath
Get-Item $zipPath | Select-Object Name, Length
