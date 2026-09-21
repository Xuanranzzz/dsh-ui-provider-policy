@echo off
setlocal
rem ============================================================
rem  dsh-ui-provider-policy one-click installer (launcher)
rem
rem  This file is ASCII on purpose. A pure-ASCII batch file is
rem  parsed identically on every Windows version and console
rem  code page, so double-click installs are reliable on both
rem  Windows 10 and Windows 11. The actual installer lives in
rem  install.ps1 (UTF-8 with BOM, Chinese UI). PowerShell is a
rem  built-in Windows component, so there are still no
rem  third-party dependencies. Double-click THIS file.
rem ============================================================
chcp 65001 >nul 2>nul
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS%" set "PS=powershell.exe"
"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
set "EXITCODE=%ERRORLEVEL%"
if not "%EXITCODE%"=="0" (
  echo.
  echo Installer failed with exit code %EXITCODE%.
  pause
)
exit /b %EXITCODE%
