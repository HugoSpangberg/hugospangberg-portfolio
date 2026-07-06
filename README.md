# Hugo Spångberg Portfolio

Detta är min personliga portfolio där jag samlar projekt, erfarenhet och saker jag bygger som utvecklare.

Sidan är byggd för att visa vem jag är, vad jag kan och hur jag tänker kring kod, automation, IoT, 3D och moderna webbapplikationer.

## Vad finns i projektet?

Portfolion består av flera delar:

* en frontend byggd med React och Vite
* egna sektioner för erfarenhet, projekt och teknik
* 3D-modeller och scener som används i portfolion
* backend/API-delar för portfolioinnehåll
* CMS-stöd för att enklare kunna uppdatera innehåll framöver

## Teknik

Några av teknikerna som används i projektet:

* React
* TypeScript
* Vite
* Three.js
* .NET
* Umbraco
* Blender
* GitHub Pages / deployment-flöde

## Kom igång lokalt

Installera dependencies:

```
npm install
```

Starta frontend lokalt:

```
npm run dev
```

Bygg projektet:

```
npm run build
```

Kör tester:

```
npm run test
```

## Miljövariabler

Det finns en `.env.example` som visar vilka miljövariabler som behövs.

Kopiera den till en lokal `.env` när du kör projektet själv:

```
cp .env.example .env
```

`.env` ska inte commitas.

## 3D och modeller

Vissa delar av portfolion använder modeller och scener som är skapade med Blender.

Modellerna ligger separat från frontend-koden och exporteras till format som kan användas i webben.

## Mål med projektet

Målet med denna portfolio är att ha en sida som känns personlig, teknisk och levande.

Jag vill visa både färdiga projekt och hur jag bygger saker — från frontend och backend till automation, 3D och egna verktyg.
