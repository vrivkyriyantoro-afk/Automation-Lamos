# Copilot instructions

Ikuti aturan di [AGENTS.md](../AGENTS.md) (root repo), lalu baca [PROJECT_HISTORY.md](../PROJECT_HISTORY.md) sebelum mengubah kode. Di akhir sesi, update `PROJECT_HISTORY.md` sesuai template di `AGENTS.md` bagian 3.

## Build, test, and lint

- Playwright is the test runner; `playwright.config.ts` targets Chromium, uses `tests/`, and defaults to one worker.
- Run all tests: `npm test` (equivalent to `playwright test --project=chromium`).
- Run one spec: `npx playwright test tests/<bucket>/<spec>.spec.ts --project=chromium`.
- Run one named test: `npx playwright test tests/<bucket>/<spec>.spec.ts --project=chromium --grep "<test title>"`.
- Verify generated section locators against the SIT app (read-only): `npx playwright test tests/sections-locator-smoke.spec.ts --project=chromium --workers=2`.
- TypeScript is not a project dependency and there is no `tsconfig.json`; use the typecheck command in [AGENTS.md](../AGENTS.md#5-verifikasi-standar) with the relevant source/test files.
- `npm run report` opens the latest Playwright HTML report.
- `package.json` has no separate build or lint scripts.

Tests use the live LAMOS SIT application and `.env` for configuration. Check a spec before running it: some tests upload files, save forms, or otherwise change application data. Keep exploration read-only unless the user explicitly authorizes state-changing actions. Never print or copy `.env` values.

## Architecture

- This repository is a Playwright + TypeScript automation suite for LAMOS, not the LAMOS application itself. `pages/LoginPage.ts` handles SSO; `pages/CreditApplicationPage.ts` is an older navigation page object.
- `pages/components/BucketSection.ts` provides `CreditApplicationForm` for credit-application URL/bucket navigation and `BucketSection` for section scoping/opening. `pages/components/FormControls.ts` wraps the shared LAMOS controls.
- Bucket-specific page objects live under `pages/bucket<Nama>/`, with section classes extending `BucketSection`. Most section classes and their `sections.ts` barrels are generated from `explore-output/<bucket>.json` by `scripts/generate-pages.js`.
- Document upload and its hierarchical document tree are manual implementations in `pages/bucketDokumen/`; Identity also contains manual guarantor/management forms alongside generated sections.
- Tests are grouped by bucket in `tests/bucket<Nama>/`; cross-bucket exploration and locator smoke tests remain directly under `tests/`. `tests/explore-all-buckets.spec.ts` captures UI structure, while `tests/sections-locator-smoke.spec.ts` checks generated locators against the live app.

## Repository-specific conventions

- Use the selector guidance in the “Konvensi DOM” table in [PROJECT_HISTORY.md](../PROJECT_HISTORY.md): prefer stable form `name` attributes over generated React `id` suffixes. Dropdown ids also contain dynamic suffixes; use their stable key/prefix and the shared `Dropdown` helper.
- LAMOS accordions are single-open and fields can appear after skeleton loading. Open sections one at a time and wait for locators/visibility instead of relying on immediate `count()` results.
- Treat files beginning `// AUTO-GENERATED` as generator output: change `scripts/generate-pages.js` or its exploration input, then regenerate. The generator does not overwrite manual files by default; do not force-overwrite them.
- Preserve exact bucket directory casing (for example, `bucketCovenantTBO`). Do not overwrite or remove user-authored `pages/bucketIdentitas/*Page.ts` or `pages/bucketDokumen/DocumentBucketPage.ts` without permission.
- If exploration reveals a new stable DOM selector pattern, add it to the “Konvensi DOM” table in `PROJECT_HISTORY.md`.
