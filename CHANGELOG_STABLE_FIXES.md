# GSTechStudent stable fixes

Applied to the stable baseline:
- EFP region canonical dropdown/code handling (10 regions).
- Super Admin EFP access.
- SRIO/SCQ regional account inheritance.
- Android PDF validation and upload workflow hardening.
- Web logout confirmation.
- Web SRIO password confirmation.
- Web SCQ Director→EFP dedicated assignment page.
- Web Gestionnaire PDF upload.
- Web Directeur/Formateur announcements.
- Web Formateur dashboard and quick actions.
- Web profile image upload/display using the existing secure MinIO/S3 backend.
- Dark-mode contrast improvements.

## 2026-09-19 — User photos, account percentages, SRIO Gestionnaires
- Android user detail/edit screen: tap the profile avatar to add or replace another user's profile picture when authorized.
- Super Admin dashboard: account distribution bars now represent `role count / total users`, with `n / total (%)` displayed.
- SRIO: regional Gestionnaire visibility now normalizes canonical region codes and legacy region names; Gestionnaires linked to a regional EFP remain visible for assignment.
- Backend: target-user profile image upload is permission-scoped; regional/EFP profile-image reads are scoped too.
