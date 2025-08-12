Autos – Manuelle Testdatei

Dateien:
- autos_template.json – JSON-Liste von Fahrzeugen. Dieses Format kann direkt von Ihrem Frontend geladen werden (z. B. /autos.json).
- autos_template.csv – Gleicher Inhalt als CSV zum einfachen Ausfüllen in Excel. Exportieren Sie danach wieder als CSV und konvertieren Sie bei Bedarf nach JSON.

Wichtige Felder:
- id / vin: Eindeutiger Schlüssel (empfohlen: VIN).
- first_registration: YYYY-MM (z. B. 2023-10).
- images, equipment, leasing_km_per_year_options: Bei CSV mit Semikolon getrennt.

Vorgehen zum Einsatz (schnell):
1) CSV in Excel ausfüllen (Spalten nicht umbenennen).
2) Als CSV speichern und bei Bedarf zurück in JSON konvertieren (oder mir schicken, ich konvertiere).
3) Datei als autos.json auf Ihren Webspace laden (z. B. https://autos.autobonau.ch/autos.json).
4) Ihre Fahrzeugseite lädt bis zur API-Freischaltung diese autos.json.

Hinweis: Preise in CHF und inkl. MWST. Passen Sie Felder nach Bedarf an.
