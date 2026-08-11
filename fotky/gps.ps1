# GPS export z fotografií do CSV
# Uložte tento soubor do složky s fotografiemi jako gps.ps1
# Poté spusťte v PowerShellu: .\gps.ps1

$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$output = Join-Path $folder "souřadnice.csv"

Add-Type -AssemblyName System.Drawing

$results = foreach ($file in Get-ChildItem -Path $folder -File) {
    if ($file.Extension -match '^\.(jpg|jpeg|tif|tiff)$') {
        try {
            $img = [System.Drawing.Image]::FromFile($file.FullName)

            $lat = $null
            $lon = $null

            # EXIF GPS tagy:
            # 2 = GPSLatitude, 4 = GPSLongitude
            # 1 = GPSLatitudeRef, 3 = GPSLongitudeRef
            if ($img.PropertyIdList -contains 2 -and $img.PropertyIdList -contains 4) {
                $latProp = $img.GetPropertyItem(2)
                $lonProp = $img.GetPropertyItem(4)

                function Get-RationalTriplet($bytes) {
                    $values = @()
                    for ($i = 0; $i -lt 24; $i += 8) {
                        $num = [BitConverter]::ToUInt32($bytes, $i)
                        $den = [BitConverter]::ToUInt32($bytes, $i + 4)
                        if ($den -eq 0) { return $null }
                        $values += ($num / $den)
                    }
                    return $values
                }

                $latValues = Get-RationalTriplet $latProp.Value
                $lonValues = Get-RationalTriplet $lonProp.Value

                if ($latValues -and $lonValues) {
                    $lat = $latValues[0] + ($latValues[1] / 60) + ($latValues[2] / 3600)
                    $lon = $lonValues[0] + ($lonValues[1] / 60) + ($lonValues[2] / 3600)

                    if ($img.PropertyIdList -contains 1) {
                        $ref = [Text.Encoding]::ASCII.GetString(
                            $img.GetPropertyItem(1).Value
                        ).Trim([char]0)
                        if ($ref -eq "S") { $lat = -$lat }
                    }

                    if ($img.PropertyIdList -contains 3) {
                        $ref = [Text.Encoding]::ASCII.GetString(
                            $img.GetPropertyItem(3).Value
                        ).Trim([char]0)
                        if ($ref -eq "W") { $lon = -$lon }
                    }

                    $lat = [Math]::Round($lat, 6)
                    $lon = [Math]::Round($lon, 6)
                }
            }

            $img.Dispose()

            [PSCustomObject]@{
                "Název souboru" = $file.Name
                "Zeměpisná šířka" = $lat
                "Zeměpisná délka" = $lon
            }
        }
        catch {
            [PSCustomObject]@{
                "Název souboru" = $file.Name
                "Zeměpisná šířka" = ""
                "Zeměpisná délka" = ""
            }
        }
    }
}

$results | Export-Csv -Path $output -Delimiter ";" -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "HOTOVO"
Write-Host "Výsledek: $output"
Write-Host ""
Write-Host "Soubor můžete otevřít v Excelu."
Read-Host "Stiskněte Enter pro ukončení"
