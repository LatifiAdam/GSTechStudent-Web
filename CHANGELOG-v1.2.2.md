# GSTechStudent Web v1.2.2

Based on the connected Web release and aligned with the current GSTechStudent backend.

## Fixes
- Super Admin: Établissements visible in navigation and create action.
- DF/Super Admin: EFP region selector now submits canonical database region codes (RSK, CS, TTA, FM, M, OR, BS, D, SMD, GON).
- SCQ: dedicated Directeur -> EFP assignment page.
- SRIO/SCQ: password confirmation for account creation and regional scope inheritance.
- Gestionnaire: PDF document creation/upload through `/documents/upload` with client-side PDF/10 MiB validation.
- Directeur/Formateur/DF: announcement creation modal wired to `/announcements`.
- Formateur dashboard: Stagiaires + Classes statistics and role-specific quick actions.
- Logout confirmation.
- Dark mode contrast improvements for blue surfaces.

## Security
- No demo accounts or hard-coded credentials.
- No SQL/MySQL/MinIO access from browser.
- JWT access/refresh tokens remain in sessionStorage.
- `.env`, node_modules and dist remain ignored.

## Build/deploy
npm install
npm run build
npm run deploy
