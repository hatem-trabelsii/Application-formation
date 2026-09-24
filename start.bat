@echo off
REM Lance ArchiPath Academy. Sans Python, ouvre directement index.html (fonctionne aussi).
cd /d "%~dp0"
set PY=
py -3 --version >nul 2>&1 && set PY=py -3
if not defined PY python --version >nul 2>&1 && set PY=python
if not defined PY (
  echo Python introuvable : ouverture directe de index.html dans le navigateur.
  start "" "%~dp0index.html"
  exit /b 0
)
echo ArchiPath Academy sur http://localhost:8000  - laissez cette fenetre ouverte, Ctrl+C pour arreter.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000"
%PY% -m http.server 8000
