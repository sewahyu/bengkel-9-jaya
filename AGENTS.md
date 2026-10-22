# Project Guidance

## User Preferences

- Bahasa antarmuka Indonesia
- Login satu akun bawaan: username admin, password admin01
- Footer menampilkan banner lima logo (UM, UM, LP3, UM Mengajar, SMKN 9 Malang)
- Kredit pencipta: Shendy Wahyu Pratama, Universitas Negeri Malang
- Peminjaman lab boleh diisi pengunjung umum tanpa login; kalender lab dapat dilihat semua pengunjung
- Instagram memakai URL feed publik (misalnya rss.app) yang ditempel admin, dengan fallback berita manual
- Akun Instagram: @bengkel9_jaya
- Inventaris dipisah menjadi dua: Trainer (data unit lama) dan Alat (inventaris baru dengan data sendiri)
- Peminjaman mandiri tanpa login hanya untuk Alat; peminjaman Trainer hanya lewat admin
- Daftar Trainer dan daftar Alat sama-sama dapat dilihat pengunjung umum
- Tata letak dioptimalkan untuk desktop

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Button asChild with disabled does not block navigation because the attribute lands on the anchor; render a real disabled button during initialization instead.
- Uploaded attachments live at .platform/attachments/; copy them into src/frontend/public/assets/images/ with a workspace-relative cp (a cp from ../ is permission-denied), then reference via /assets/images/<file>.
- A light logo container inside the dark bg-primary footer uses bg-background + text-foreground so the emblem stays legible; keep the img h-14 w-auto object-contain with intrinsic width/height to avoid distortion.
- APP_NAME in src/frontend/src/lib/constants.ts drives the header brand title, so a brand rename is a one-line constant change.
- The header brand logo sits in a size-10 bg-background container with ring-1 ring-border and an h-8 w-auto object-contain img, keeping the emblem legible on the light card header.
- index.html title/og:title are not driven by APP_NAME and can drift from the header brand after a rename.
- useActor(createActor) from @caffeineai/core-infrastructure calls useInternetIdentity() internally, so InternetIdentityProvider must stay mounted in main.tsx even when the app uses username/password login.
- When a test-owned file under src/__tests__ fails the production tsc gate, exclude src/__tests__ in tsconfig.json rather than editing test logic.
- mops.toml [lint] extends = true pulls in every dependency's rules, including caffeineai-authorization's include-authorization rule; when a project intentionally replaces the authorization mixin, set extends to the specific packages (e.g. ["caffeineai-lints"]).
- The applied migration file in src/backend/migrations is read-only; a state-shape change must be a NEW timestamped migration whose OldActor equals the previous migration's NewActor.
- A Map keyed on Principal needs `import Principal "mo:core/Principal"` in every file that calls Map operations on it, even when no Principal method is referenced.
- A wide multi-logo banner keeps full proportions in the footer with h-auto w-full object-contain inside a max-w-md light container; intrinsic width/height reserve layout space.
- A cp from the workspace root into app/src/frontend/public/assets/images/ is allowed, but a cp whose source path starts with ../ or an absolute path is permission-denied.
- Public visitor mutations (ajukanPeminjaman/ajukanPeminjamanLab) must invalidate the admin list query keys so newly submitted requests appear without a manual refresh.
- Admin-guarded queries (listPeminjaman, listNota) must only be mounted inside AdminGuard, otherwise an anonymous actor traps the query.
- The hero color tokens (colors.hero) are registered without <alpha-value>, so border-hero/20 and bg-hero/5 render fully opaque; use primary-foreground/20 for translucent hero chrome and reserve text-hero/text-hero-muted for the legibility fix.
- A dependency-free .xlsx writer works by emitting OOXML parts into a store-method ZIP; eksporXlsx(namaBerkas, namaSheet, baris) takes SelExcel[][] where the first row is the header.
- A client-side feed fetch must normalize both RSS-JSON (items/entries) and array payloads, and fall back to backend manual news when the feed is empty or errors, so the section is never blank.
- Biome's useSemanticElements rule rejects role="group" on a div; use a native <fieldset> with aria-label for grouped filter controls.
- OQL entities for records with ?Text optionals and Text enum-like fields use toEntityManual with explicit .payload per field; .public_() makes them readable by anonymous visitors.
- The local preflight tester cannot log into the built-in admin account, so admin-only flows and any feature needing seeded data (e.g. unit trainers) stay unverified by local QA.
- After splitting one inventory map into two, audit every consumer of the old hook: home-page stat cards can keep a label while silently reading the wrong map.
- Peminjaman stock routing keys on jenis ('trainer'|'alat'); ajukanPeminjamanAlat is the only anonymous path and never mutates stock.
- The /trainer and /alat routes declare validateSearch, so every Link to them must pass search={{}} or typecheck fails.
- Trainer and Alat share the same jumlahTotal/jumlahTersedia shape, so stat reducers are interchangeable once the correct hook is wired.
