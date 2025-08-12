Auto Bonau – Drop‑in Daten‑Loader (layout bleibt unverändert)

Dateien
- autos-data.js   – nur Daten/Markup, keine Styles. Dein bestehendes CSS bleibt.
- autos.json      – Beispielautos (kannst du ersetzen).
- index_demo.html – kleine Demo. Für deine Seite nicht nötig.

Integration in deine bestehende Seite
1) Lege einen Container an, z. B.
   <div id="autos-grid"></div>

2) Binde das Script ein (unterhalb des Containers):
   <script src="/pfad/zu/autos-data.js"></script>

3) Falls dein Container anders heisst, passe oben in autos-data.js an:
   const TARGET_SELECTOR = '#autos-grid';

Pfad zur JSON
- Script versucht zuerst ./autos.json (gleiches Verzeichnis wie die Seite).
- Fallback ist https://autobonau.github.io/autos.autobonau.ch/autos.json

Damit bleibt dein ganzes Design 1:1 erhalten.
