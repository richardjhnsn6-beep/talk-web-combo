# PRD — rjhnsn12 Biblical Truth & History

## Original Problem Statement
Build a 24/7 B2B radio + AI Sales Agent ("AI Richard Johnson") platform that autonomously sells memberships/books while strictly honoring the user's theological research. Core features: Book of Amos bilingual study, AI Art Gallery, Radio with TTS DJ, Marketing Automation (zero API keys), Pay-as-you-go credits.

## User Persona
- Richard Johnson — non-technical founder, uses voice-to-text, prints pages physically. Needs aggressive UI compression to save paper.
- End users: Biblical students looking for authentic 20-letter ancient Hebrew study materials.

## Core Requirements (Current)
1. Book of Amos with Chapters 1-10 — Pure Hebrew, Word-by-Word, Bilingual, Concordance views.
2. 24/7 streaming radio at `/radio` with TTS DJ announcements.
3. AI Sales Agent widget (`AIRichard.js`) + Admin Dashboard.
4. Marketing Automation via frontend popups only (NO third-party API keys).
5. Pay-as-you-go credit tiers: Free, Basic ($2), Premium ($5), $14 Amos Discount, $20 Amos Complete.
6. **Internal Book Preview** — admin-only complete book mockup so author can proof the book before selling.

## Hard Constraints
- NO third-party APIs for marketing (Resend/SendGrid rejected by user).
- Chapter 10 Concordance 8-column compressed layout must NOT be "beautified" or expanded.
- Do NOT auto-populate missing Strong's numbers.
- Do NOT use Richard's photo on book cover (user instruction).
- Chapters 5-9 bilingual wording is DRAFT — user will rewrite per-paragraph to line up Hebrew/English.

## Implementation Log

### 2026-02-20 — Complete Book Preview + Draft Flagging ✅
- Extracted shared chapter data into `/app/frontend/src/data/amosBilingualData.js` (chapters 1-9 interlinear + curated bilingual for 1 & 4, helper `getBilingualForChapter(n)` and `chapterMetadata` with draft/finalized status).
- New page `/app/frontend/src/pages/BookPreview.js` at route `/book-preview` (admin-only via AdminLogin wrapper) — renders print-ready 6×9" book mockup: elegant typography cover (no photo), copyright page, table of contents, all 9 chapters bilingual, back cover.
- Print-optimized CSS (`@page size: 6in 9in`, page breaks between chapters, avoid-break-inside on verses).
- "🖨 Print book" button invokes `window.print()`.
- Toolbar banner: "INTERNAL BOOK PREVIEW — NOT FOR DISTRIBUTION".
- Chapters 5-9 (and 2, 3) bilingual view on `/book-of-amos` now shows a prominent yellow **DRAFT warning banner** so nothing gets shipped unfinalized.
- Verified: 9 chapter sections, 135 total verses, cover + TOC + back cover all render; Ch6 shows draft banner, Ch1 does not.

### 2026-02-20 — Bilingual view for Chapters 5-9 ✅
- `renderBilingual()` now supports chapters 1-9 via `interlinearToBilingual()` helper (auto-generates parallel Hebrew/English from existing interlinear word arrays).
- Hebrew left column, English right column, verse numbers on both sides.
- Ch5=27 verses, Ch7=17 verses, Ch9=15 verses rendering correctly.

### 2026-02-20 — Admin bypass for Premium Upgrade Gate ✅
- Added admin bypass in `handleChapterClick` using existing `localStorage.admin_ai_access === 'RJHNSN12admin2026'`.
- Owner can now review all chapters (6-10) without triggering the upgrade modal.

### Prior Session — Marketing Automation Phase 1 (Premium Upgrade Gate) ✅
- Backend route `/api/access/check-access` for tier-based content gating.
- Frontend `UpgradeModal` triggers when Free/Basic users click Chapters 6-10.

### Prior Session — Chapter 10 Master Hebrew Concordance ✅
- Ultra-compressed 8-column split layout `(V|HEB|ENG|NUM | V|HEB|ENG|NUM)`.
- Populated with all 9 chapters of Hebrew/English text.

## Backlog (Prioritized)

### P1 — Up Next
- [ ] **User rewrites Chapters 5-9 bilingual wording** so Hebrew left / English right line up per-paragraph (like Ch 1 & 4). Agent will then finalize the curated versions in `amosBilingualData.js` and flip `bilingualStatus` from `"draft"` → `"finalized"`.
- [ ] **Radio DJ TTS volume too low** — boost via pydub/ffmpeg in `backend/routes/radio.py`.

### P2
- [ ] Landscape menu scrolling on mobile (App.js nav CSS).
- [ ] Expand behavior-based marketing automations ("Support the ministry" banner for radio listeners, repeat-visitor popups).
- [ ] Replace placeholder images in `/ai-art` gallery (waiting on user images).
- [ ] Optional: in-app editor for author to edit Ch 5-9 bilingual without touching code.

### P3
- [ ] Finish refactor of `BookOfAmos.js` (still >2600 lines) — migrate remaining interlinear local copies to `amosBilingualData.js` (data file now exists).
- [ ] Add Book of Daniel in same compressed concordance format.
- [ ] Consolidate duplicate AI chat interfaces (`/ai-chat` vs `AIRichard.js` widget).
- [ ] Remove defunct `/app/backend/routes/ai_image_gen.py`.

### Future
- Help user publish English translated biblical books to Amazon/Barnes & Noble.

## 3rd Party Integrations
- Anthropic Claude Sonnet 4 (Emergent LLM Key)
- OpenAI TTS (Emergent LLM Key)
- PayPal Subscriptions/Credits (external links, no API)

## Key Architecture
```
/app/
├── backend/
│   ├── routes/
│   │   ├── ai_richard.py, analytics.py, content_access.py,
│   │   │   membership.py, paid_members.py, radio.py
│   └── server.py
└── frontend/src/
    ├── components/{AIRichard.js, AdminLogin.js}
    ├── data/amosBilingualData.js   (NEW - shared chapter data)
    └── pages/
        ├── BookOfAmos.js           (reading view + DRAFT banner for Ch 5-9)
        └── BookPreview.js          (NEW - admin-only complete book mockup)
```

## Credentials
- Admin/Paywall bypass: `RJHNSN12admin2026` (stored in `localStorage.admin_ai_access` and `sessionStorage.admin_authenticated`).
- `/book-preview` requires admin password via `AdminLogin` wrapper.
