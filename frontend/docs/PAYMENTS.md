
Um Apple In-App-Käufe für Deine Abonnements zu implementieren, folge diesen Schritten:

## 1. App Store Connect einrichten

1. Gehe zu [App Store Connect](https://appstoreconnect.apple.com)
2. Erstelle Deine App (falls noch nicht geschehen)
3. Wähle "Funktionen" → "In-App-Käufe" → "+" → "Abonnement"
4. Erstelle zwei Abonnement-Gruppen:
   - SnapOCR Premium Abonnements
5. Füge Produkte hinzu:
   - SnapOCR Premium Monatlich ($9.99)
   - SnapOCR Premium Jährlich ($99.99)
6. Für jedes Produkt:
   - Füge Screenshots/Beschreibungen hinzu
   - Wähle Preispunkte für internationale Märkte
   - Definiere Testdaten für Sandbox-Umgebung

## 2. RevenueCat integrieren

RevenueCat ist eine Bibliothek, die In-App-Käufe vereinfacht:

```bash
npm install react-native-purchases
```

Konfiguration in der App:


## 3. Backend Anpassungen für Apple In-App-Käufe

Nun müssen wir das Backend anpassen, um Zahlungsbelege von Apple zu verifizieren:






## 4. Frontend-Integration für Subscription Plans

Als Nächstes aktualisieren wir die Subscription Plans Komponente, um In-App-Käufe zu unterstützen:


## 5. In-App-Käufe im User-Kontext initialisieren

Wir müssen sicherstellen, dass RevenueCat direkt nach der Anmeldung initialisiert wird:


Das AuthContext-File hat einige Fehler verursacht. Lass uns eine einfachere Anpassung machen:


## 6. App.json für In-App-Käufe aktualisieren

Zuletzt müssen wir die App.json Datei aktualisieren, um In-App-Käufe zu unterstützen:

Read file: frontend/app.json


## Zusammenfassung

Du hast jetzt alle notwendigen Komponenten für Apple In-App-Käufe in deiner App implementiert:

1. **App Store Connect-Setup**: 
   - Registriere deine Premium-Abonnements im App Store Connect
   - Konfiguriere die Preise und Testdaten

2. **RevenueCat-Integration**:
   - Die Bibliothek ist eingebunden und initialisiert
   - Die Benutzer-ID wird synchronisiert

3. **Backend-API**:
   - APIs zum Verifizieren und Wiederherstellen von Käufen
   - Verwaltung der Abonnementstatus

4. **Frontend-Komponenten**:
   - Verbesserte Subscription Plans-Seite
   - Kaufabwicklung
   - "Käufe wiederherstellen"-Button

5. **Konfiguration**:
   - App.json für In-App-Käufe aktualisiert

Bevor du deine App veröffentlichst:

1. **RevenueCat-Konto erstellen** unter [revenuecat.com](https://www.revenuecat.com/)
2. Ersetze die Platzhalter mit deinen tatsächlichen API-Schlüsseln
3. Konfiguriere deine Produkte in RevenueCat und App Store Connect
4. Teste die Käufe im Sandbox-Modus

Für den App Store-Veröffentlichung:

1. Stelle sicher, dass deine App alle Apple-Richtlinien für In-App-Käufe einhält
2. Füge die erforderlichen Screenshots für In-App-Käufe bei der App-Einreichung hinzu
3. Beantworte die Fragen zum Abonnement-Informationsblatt

Viel Erfolg mit deiner Premium-Subscription-Funktion! Wende dich bei Fragen gerne wieder an mich.
