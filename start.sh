#!/usr/bin/env sh
# Lance ArchiPath Academy sur http://localhost:8000. Sans Python, ouvre directement index.html.
cd "$(dirname "$0")"
ouvrir() { (xdg-open "$1" || open "$1") >/dev/null 2>&1; }
if command -v python3 >/dev/null 2>&1; then PY=python3
elif command -v python >/dev/null 2>&1; then PY=python
else echo "Python introuvable : ouverture directe de index.html"; ouvrir "$PWD/index.html"; exit 0; fi
echo "ArchiPath Academy → http://localhost:8000  (laissez ce terminal ouvert, Ctrl+C pour arrêter)"
( sleep 2; ouvrir http://localhost:8000 ) &
exec "$PY" -m http.server 8000
