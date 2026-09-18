# GSTechStudent-Web v1.2.0

## Requested fixes

### Super Admin
- EFP / Établissements tab restored in the Web UI.
- EFP creation action available in the Web UI.
- Logout now asks for confirmation.
- **Backend patch required:** allow `superadmin` on `GET/POST /etablissements`.

### DF
- EFP region is a dropdown using the ten canonical database region names.

### SRIO
- User creation has a password confirmation field.
- Regional user creation sends the SRIO's own region so newly-created Gestionnaires remain visible in the scoped list.

### SCQ
- Director list uses the scoped `/users` result and filters Directors, fixing newly-created Director visibility.
- Added dedicated `Affectation` page to assign a Director to an EFP.
- The backend validates that the EFP is inside the SCQ's region.

### Gestionnaire
- Added `Créer un document` on the Documents page.
- PDF upload uses `POST /documents/upload`.
- The backend routes the document to the Director assigned to the Gestionnaire's EFP with pending status.

### Directeur
- Added announcement creation modal using `POST /announcements` with the backend's enum values.
- Documents page now displays pending documents and provides validation/refusal actions.

### Formateur
- Dashboard statistics replace Utilisateurs / Établissements with Stagiaires / Classes.
- Quick access now points to Groupes / Stagiaires / Planning.
- Stagiaires page is built from `/classes/mine` so it respects the Formateur's backend scope.

### General UI
- Dark mode contrast improved for text/icons on blue backgrounds.
- API data remains backend-driven; the browser does not access MySQL/MinIO directly.
- No demo profile or demo credentials remain.
