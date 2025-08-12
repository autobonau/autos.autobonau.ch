Auto Bonau – GitHub Pages Bundle (Auto‑Detect)

Dateien
- index.html – robuster Loader mit mehreren Pfad‑Fallbacks (gleiches Verzeichnis, Site‑Root, GitHub Pages, raw.githubusercontent.com).
- index_inline.html – Daten sind inline eingebettet (funktioniert ohne Fetch).
- autos.json – zwei Beispiel‑Fahrzeuge.

Deployment
1) Alle Dateien in den Root des GitHub‑Pages‑Branches (z. B. main) pushen.
2) Settings → Pages aktivieren (Source: main / root).
3) Aufrufen: https://USER.github.io/REPO/index.html
4) Falls Custom‑Domain (z. B. autos.autobonau.ch), DNS‑CNAME setzen und im Repo eine Datei CNAME mit dem Domain‑Namen anlegen.

Hinweise
- index.html zeigt unterhalb die versuchten Pfade. Sieht man dort eine 404‑URL, liegt autos.json vermutlich im falschen Ordner.
- Cache hart neu laden (Ctrl/Cmd+Shift+R), sonst siehst du alte Antworten.
- Bei Bedarf in index.html oben CONFIG.github_user / github_repo ausfüllen, um RAW‑Fallbacks zu aktivieren.
