@echo off
title TTS RFID Bridge
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies for the first time...
  echo This may take 1-2 minutes.
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. See messages above.
    pause
    exit /b 1
  )
)

echo Starting auto-OK helper for FUJITSU driver dialog...
start "" /b powershell -ExecutionPolicy Bypass -File "%~dp0auto-ok.ps1"

echo Starting RFID bridge service...
echo.
echo Keep this window open. Closing it stops the bridge.
echo Press Ctrl+C to stop the bridge cleanly.
echo.
call npm start

echo.
echo Bridge stopped.
pause
