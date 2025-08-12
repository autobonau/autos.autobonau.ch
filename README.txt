Auto Bonau – Pages Bundle

Dateien
- index.html     – laedt autos.json relativ. Fuer GitHub Pages einfach alle Dateien in den Root des Pages-Branches.
- index_inline.html – gleiche Ansicht mit eingebetteter JSON (funktioniert ohne fetch).
- autos.json     – Beispieldaten (2 Fahrzeuge).

Deployment GitHub Pages
1) Dateien ins Repo (Root) pushen.
2) Repo Settings → Pages → Branch und Root waehlen.
3) Seite oeffnen: https://USER.github.io/REPO/index.html
4) autos.json ist dann unter https://USER.github.io/REPO/autos.json erreichbar.
5) Optional CNAME: autos.autobonau.ch

Hinweis
- Wenn index.html "Fehler beim Laden" zeigt, liegt autos.json nicht im selben Ordner oder Pages ist noch nicht aktiv.
