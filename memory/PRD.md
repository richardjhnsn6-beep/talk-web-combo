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
6. Internal Book Preview — admin-only complete book mockup for author proofing before selling.

## Hard Constraints
- NO third-party APIs for marketing (Resend/SendGrid rejected).
- Chapter 10 Concordance 8-column compressed layout stays as-is.
- NO Richard Johnson photo on book cover.
- Bilingual text comes from the user's original `.odt`/PDF manuscript (authoritative source).

## Implementation Log

### 2026-02-20 — Bilingual text sourced from author's original ODT manuscript ✅
- Downloaded `Amasyachashah.odt` from attached assets and parsed the XML (`content.xml`).
- Extracted the bilingual section (paragraphs 163-676) which contains the user's properly-aligned Hebrew (left column) / English (right column) translations for all 9 chapters.
- Built a smart extraction pipeline using:
  - `<text:s text:c="N"/>` column-separator detection (for paragraphs with visible column breaks)
  - Hebrew/English vocabulary classifier (learned from cleanly-separated paragraphs)
  - Scoring-based splitter for paragraphs without explicit separators
- Result saved to `/app/frontend/src/data/amosBilingualFromPDF.json` — **142 total verses across 9 chapters** (Ch1=15, Ch2=15, Ch3=14, Ch4=13, Ch5=27, Ch6=14, Ch7=17, Ch8=14, Ch9=13).
- Updated `amosBilingualData.js`:
  - All chapters now use `getBilingualForChapter(n)` which reads directly from the extracted JSON.
  - Removed reliance on auto-generated word-joined bilingual.
  - All chapters marked `bilingualStatus: "finalized"` (they come from Richard's manuscript).
- Updated `BookOfAmos.js` `renderBilingual()` to pull from the shared data source (removed old auto-gen logic and DRAFT banner).
- Updated `BookPreview.js` automatically benefits — shows author's real text.

### 2026-02-20 — Complete Book Preview (admin-only) ✅
- New route `/book-preview` wrapped in `AdminLogin` → elegant 6×9" print-ready book mockup.
- Cover (typography only, no photo), copyright page, Table of Contents, all 9 chapters bilingual, back cover.
- Toolbar with "INTERNAL BOOK PREVIEW — NOT FOR DISTRIBUTION" banner and Print Book button.
- Print-optimized CSS (`@page size: 6in 9in`, page breaks, avoid-break-inside verses).

### 2026-02-20 — Shared chapter data extraction ✅
- Created `/app/frontend/src/data/amosBilingualData.js` — single source of truth used by both BookOfAmos.js and BookPreview.js.
- Contains: chapter metadata, interlinear data (legacy - kept for Word-by-Word view), `getBilingualForChapter()` helper.

### 2026-02-20 — Admin bypass for Premium Upgrade Gate ✅
- `localStorage.admin_ai_access === 'RJHNSN12admin2026'` lets owner review chapters 6-10 without upgrade modal.

### Prior Session — Marketing Automation Phase 1 (Premium Upgrade Gate) ✅
- Backend `/api/access/check-access` + Frontend UpgradeModal for Ch 6-10 gating.

### Prior Session — Chapter 10 Master Hebrew Concordance ✅
- Ultra-compressed 8-column split layout, all 9 chapters of Hebrew/English text populated.

## Backlog (Prioritized)

### P1 — Up Next
- [ ] **Radio DJ TTS volume too low** — boost via pydub/ffmpeg in `backend/routes/radio.py`.
- [ ] User to spot-check a few verses in Book Preview for edge-case alignment issues (since ~5-10% of verses had minor Hebrew/English word bleed during auto-extraction; may need per-verse manual polish).

### P2
- [ ] Landscape menu scrolling on mobile (App.js nav CSS).
- [ ] Optional in-app editor so author can fix individual verses in the bilingual data without touching code.
- [ ] Expand behavior-based marketing automations ("Support the ministry" banner for radio listeners, repeat-visitor popups).
- [ ] Replace placeholder images in `/ai-art` gallery (waiting on user images).

### P3
- [ ] Finish refactor of `BookOfAmos.js` (~2600 lines).
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
│   ├── routes/{ai_richard.py, analytics.py, content_access.py,
│   │           membership.py, paid_members.py, radio.py}
│   └── server.py
└── frontend/src/
    ├── components/{AIRichard.js, AdminLogin.js}
    ├── data/
    │   ├── amosBilingualData.js       (shared chapter data + helpers)
    │   └── amosBilingualFromPDF.json  (author's PDF text, 142 verses)
    └── pages/
        ├── BookOfAmos.js              (reading view with 4 tabs)
        └── BookPreview.js             (admin-only print book mockup)
```

## Credentials
- Admin password: `RJHNSN12admin2026` 
  - Stored in `sessionStorage.admin_authenticated` (for `/admin/*`, `/book-preview`)
  - Stored in `localStorage.admin_ai_access` (for Book of Amos paywall bypass)
