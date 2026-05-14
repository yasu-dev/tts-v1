# Auto-dismiss FUJITSU RFRWUMPHID_Drv driver dialog that appears on bridge startup.
# Watches for the dialog window for up to 30 seconds and sends Enter to it.
# Safe to run as a background helper; exits silently if the dialog never appears.

$ErrorActionPreference = 'SilentlyContinue'
$end = (Get-Date).AddSeconds(30)
$wshell = New-Object -ComObject wscript.shell
$dismissed = $false

while ((Get-Date) -lt $end) {
    try {
        if ($wshell.AppActivate('RFRWUMPHID_Drv')) {
            Start-Sleep -Milliseconds 200
            $wshell.SendKeys('{ENTER}')
            $dismissed = $true
            break
        }
    } catch {}
    Start-Sleep -Milliseconds 500
}

if ($dismissed) {
    Write-Host "[auto-ok] FUJITSU driver dialog dismissed."
} else {
    Write-Host "[auto-ok] No driver dialog appeared within 30s (this is fine)."
}
