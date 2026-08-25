@echo off
REM TaxSage Prototype - one-command start (Windows)
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting TaxSage prototype with Node...
  node server.js
) else (
  echo Node.js was not found. Install it from https://nodejs.org and run this again,
  echo or open dist\index.html through any static file server.
  pause
)
