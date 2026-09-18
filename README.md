# GSTechStudent Web

Web frontend for the same GSTechStudent NestJS API used by the Android application.

## Architecture

`Browser -> NestJS /api/v1 -> TypeORM -> MySQL`

The browser never connects directly to MySQL or MinIO. Authentication uses the API's JWT access/refresh tokens. The frontend refreshes the access token when the API returns 401.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the address reachable from the computer running the browser, for example:

```env
VITE_API_BASE_URL=http://192.168.1.19:3000/api/v1
```

## Backend CORS

The NestJS backend must allow the web origin. For LAN testing, `CORS_ORIGIN=*` is the simplest option because this frontend sends JWTs in the `Authorization` header and does not use cookie credentials. For production, prefer the exact HTTPS origin.

## GitHub Pages

The Vite base is `/GSTechStudent-Web/`. Build with the production API URL available at build time:

```bash
VITE_API_BASE_URL=https://api.gstech.ma/api/v1 npm run build
npm run deploy
```

Do not put MySQL, MinIO, JWT secrets, or backend `.env` values in this frontend repository.

## Backend integration and security

This web client is designed to use the same NestJS API as the GSTechStudent Android application. The browser communicates only with `VITE_API_BASE_URL` and never connects directly to MySQL or MinIO.

- Authentication: `POST /api/v1/auth/login`, optional 2FA, JWT access/refresh tokens, refresh rotation and logout.
- Access control: the backend remains authoritative for RBAC; the web UI only adapts navigation and actions to the JWT role.
- Database data: users, establishments, classes, courses, schedules, attendance, grades, documents, document requests and announcements are loaded through protected API endpoints.
- Login: there are no demo profiles or hard-coded credentials.
- SQL injection: the browser does not build SQL queries. Inputs are sent as JSON to NestJS, where DTO validation and TypeORM/parameterized queries must enforce validation and database safety.
- Client-side validation is only an additional usability layer; it is not a security boundary.
- Tokens are kept in `sessionStorage` rather than persistent local storage and are cleared on logout/session invalidation.
- Do not commit `.env`, `node_modules/`, or `dist/`.
- For production, serve the website over HTTPS and set `CORS_ORIGIN` on the API to the exact web origin rather than `*`.
## Sécurité

- Aucun compte de démonstration ou mot de passe codé en dur.
- Le navigateur communique uniquement avec NestJS via `/api/v1`; il ne se connecte jamais directement à MySQL ou MinIO.
- Les tokens de session sont conservés dans `sessionStorage` et sont renouvelés via `/auth/refresh`.
- Les erreurs HTTP `5xx` sont masquées côté interface pour éviter d'exposer des détails internes du serveur.
- Le backend reste l'autorité de sécurité : validation DTO, JWT, rôles et limitation des tentatives doivent rester actifs.
- En production, utilisez HTTPS et une origine CORS explicite, pas `*`.

## Vérification locale

```bash
npm install
npm run build
```

`package-lock.json` est généré par `npm install` et doit être conservé dans Git pour figer les versions installées.

## CI

GitHub Actions includes a build check on pushes and pull requests to `main`. It installs the declared npm dependencies and runs `npm run build`.

## Version 1.2.0 — role workflows and UI fixes

- Removed the demo profile/login concept; authentication requires real backend accounts.
- Super Admin EFP access is wired in the Web UI; apply the included backend patch to allow `GET/POST /etablissements` for `superadmin`.
- SRIO/SCQ regional account creation now sends the creator's region and the backend patch enforces it.
- SRIO/SCQ role lists use the scoped `/users` response and filter by the required role, fixing newly-created regional account visibility.
- Added password confirmation to user creation.
- Added a dedicated SCQ Directeur → EFP assignment page.
- Added Gestionnaire document upload (PDF) with backend routing to the Director of the same EFP for validation.
- Added Director document validation/refusal actions.
- Added working announcement creation modal for Director/DF/Formateur using the backend DTO.
- Formateur dashboard statistics now show Stagiaires and Classes, and quick access points to Groupes and Stagiaires.
- Added logout confirmation.
- Improved dark-mode contrast for text on blue backgrounds.

## Backend patch

See `backend-patch/README.md` and the three patch files included in this archive. Apply them to the backend repository on the Ubuntu server before testing the Super Admin EFP workflow and regional account creation.

## v1.2.2 backend dependency
For Super Admin EFP creation and regional SRIO/SCQ account workflows, deploy the matching backend changes from the GSTechStudent mobile/backend package. The browser never accesses MySQL directly.
