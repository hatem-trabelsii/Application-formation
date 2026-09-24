#!/usr/bin/env sh
# Lance ArchiPath Academy sur http://localhost:8000 (optionnel : index.html s'ouvre aussi par double-clic)
cd "$(dirname "$0")"
echo "ArchiPath Academy → http://localhost:8000  (Ctrl+C pour arrêter)"
( sleep 1; (xdg-open http://localhost:8000 || open http://localhost:8000) >/dev/null 2>&1 ) &
python3 -m http.server 8000 2>/dev/null || python -m http.server 8000
