## Dokumentation / Anleitung (für wenn Plugin published ist)

1. Plugin installieren via npm install (Plugin inkl Command in Strapi Marketplace sichtbar)
2. Plugin Settings im Admin Panel (translationstudio Icon / Button in der linken Leiste) öffnen
3. Translationstudio Lizenz einfügen und speichern
4. Access Token generieren und in account.translationstudio.tech Konfiguration angeben
5. Übersetzungen erfolgen innerhalb des jeweiligen Entrys im Content Manager

## Lokale Entwicklung (Simulation von npm Package via yalc)

1. strapi Projekt (v5+ installieren)
2. npm install -g yalc
   in Plugin Ordner:
3. npm install (bei Error mit --legacy-peer-deps Flag)
4. npm run:watch link
   In strapi Ordner:
5. npx yalc add --link _Plugin Ordner Name_
6. npm run develop

## Testen der Translation Funktionalität / Kommunikation mit translationstudio

1. ngrok http 1337
   In strapi Ordner:
2. ngrok url in /config/server.ts replacen
   (in Plugin Ordner:)
   (2.5. translationstudio plugin mit npm run:watch link starten)
   In strapi Ordner:
3. npm run develop
4. Settings Page (translationstudio Icon, linke Leiste im Admin Panel) öffnen
5. translationstudio Lizenz einfügen und speichern
6. Access Token generieren und auf account.translationstudio.tech speichern
7. Sprachauswahl und Translation-Button findet man innerhalb jedes Entries
