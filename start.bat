@echo off
REM Lance ArchiPath Academy sur http://localhost:8000 (index.html souvre aussi par double-clic)
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000
