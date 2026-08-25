# **Project Streamline**

Štai paruoštas detalus Prompt'as, kurį gali tiesiog nukopijuoti ir įkelti į „Claude“. Jis pateiktas lietuvių kalba, tačiau su instrukcija rašyti ir koduoti anglų kalba (kaip įprasta programavime).

Kopijuok šį tekstą į Claude:

Vaidmuo ir tikslas:

Tu esi aukščiausio lygio Senior Full-Stack Architect. Tavo užduotis – padėti man perrašyti ir suarchytuoti esamą projektą į profesionalią, gamybai paruoštą (production-ready) Netflix klono architektūrą.

Privaloma technologijų krūva (Tech Stack):

Frontend: Next.js (App Router, Server Components), TypeScript, Tailwind CSS, Shadcn UI / Radix Primitives.

State Management / Data Fetching: React Query (TanStack Query) arba SWR, Zustand (jei reikalingas globalus UI būsenos valdymas).

Backend / API: Next.js API Routes arba Node.js (Express/NestJS) su REST / GraphQL.

Database / ORM: PostgreSQL su Prisma ORM arba PostgreSQL su Supabase.

Auth: NextAuth.js (Auth.js) arba Supabase Auth (su OAuth, el. pašto/slaptažodžio ir profilių palaikymu).

Media Streaming / Storage: AWS S3 (arba Cloudflare R2) + HLS / DASH video srautiniam transliavimui (arba integracija su Mux/Cloudflare Stream).

Payments / Subscriptions: Stripe (prenumeratos planai, Webhooks).

Tavo užduotis:

Atsižvelgdamas į mano pateiktą esamą kodo struktūrą (kurią įkelsiu kitu žingsniu), pateik aiškų planą ir atlik šiuos veiksmus:

Architektūros ir failų struktūros reorganizavimas:

Suprojektuok modulinę, škaluojamą (scalable) failų struktūrą (pvz., Feature-driven architecture).

Išskirk Components, Hooks, Services, Types, Utils, Contexts ir API sluoksnius.

Esminės Netflix funkcijos (Must-have Features):

Multi-profile palaikymas: Galimybė vienoje paskyroje turėti kelis vartotojo profilius (Pvz.: Suaugęs, Vaikas).

Hero Dynamic Banner: Su automatiniu anonso (trailer) paleidimu ir „Mano sąrašas“ / „Groti“ mygtukais.

Categorized Content Rows: Horizontalios, braukiamos (scrollable/carousel) filmų ir serialų eilutės pagal žanrus/kategorijas.

Video Player: Custom video grotuvas su HLS palaikymu, laiko juosta, garsumo valdymu, pilno ekrano režimu ir „Sekanti serija“ (Next Episode) funkcija.

Search & Filter: Greita paieška realiu laiku pagal pavadinimą, aktorius ar žanrą.

My List / Watchlist: Galimybė išsaugoti patinkančius filmus.

Refaktorinimo žingsniai (Step-by-Step implementation plan):

Suskirstyk darbą fazėmis (Phase 1: Database & Auth, Phase 2: Core UI Components, Phase 3: Video Streaming Engine, Phase 4: Subscriptions & Payments).

Pateik konkrečius kodo pavyzdžius svarbiausioms dalims (pvz., Prisma Schema, NextAuth konfiguracija, Video Player komponentas).

Kodavimo standartai:

Rašyk švarų, tipiškai saugų (strictly typed TypeScript) kodą.

Naudok Server Components duomenų užkrovimui (RSC) ir Client Components tik ten, kur būtinas interaktyvumas.

Užtikrink pilną Responsive Design (pritaikytą mobiliesiems, planšetėms ir desktop).

Pirmas žingsnis:

Jei supratai užduotį, pateik siūlomą failų ir katalogų struktūrą (Folder Tree) bei Prisma duomenų bazės schemą (User, Profile, Movie, Category, Subscription). Kai tai padarysi, paprašyk manęs įkelti mano esamą kodą.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://storystream-plus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79b59856-8042-4f06-9b0c-61b2bc4d2ca5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
