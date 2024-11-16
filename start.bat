@echo off
cd /d "%~dp0"
start /min cmd /c npm run dev
timeout /t 5 /nobreak
start http://localhost:5173