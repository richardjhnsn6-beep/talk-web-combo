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

## Hard Constraints
- NO third-party APIs for marketing (Resend/SendGrid rejected by user).
- Chapter 10 Concordance 8-column compressed layout must NOT be "beautified" or expanded.
- Do NOT auto-populate missing Strong's numbers.
- Chapter 10 uses compressed layout to save printing costs.

## Implementation Log

### 2026-02-20 — Bilingual view for Chapters 5-9 ✅
- Added `interlinearToBilingual()` helper in `BookOfAmos.js` that converts word-array interlinear data into full Hebrew/English parallel sentences.
- `renderBilingual()` now supports chapters 1-9 (curated data for 1 & 4; auto-generated from interlinear for 2, 3, 5-9).
- Hebrew left column, English right column, verse numbers on both sides.
- Added `data-testid="bilingual-chapter-N"` and `data-testid="bilingual-verse-N-M"` for testability.
- Verified in browser: Ch5=27 verses, Ch7=17 verses, Ch9=15 verses.

### 2026-02-20 — Admin bypass for Premium Upgrade Gate ✅
- Added admin bypass in `handleChapterClick` using existing `localStorage.admin_ai_access === 'RJHNSN12admin2026'`.
- Owner can now review all chapters (including 6-10) without triggering the upgrade modal.

### Prior Session — Marketing Automation Phase 1 (Premium Upgrade Gate) ✅
- Backend route `/api/access/check-access` for tier-based content gating.
- Frontend `UpgradeModal` triggers when Free/Basic users click Chapters 6-10.
- Verified modal renders correctly.

### Prior Session — Chapter 10 Master Hebrew Concordance ✅
- Ultra-compressed 8-column split layout `(V|HEB|ENG|NUM | V|HEB|ENG|NUM)`.
- Populated with all 9 chapters of Hebrew/English text.
- ~45 Strong's numbers added; rest placeholders (user-approved).

## Backlog (Prioritized)

### P1 — Up Next
- [ ] **Radio DJ TTS volume too low** — boost via pydub/ffmpeg in `backend/routes/radio.py`.
- [ ] **User to manually verify bilingual chapters 5-9** translation accuracy (viewer now available).

### P2
- [ ] Landscape menu scrolling on mobile (App.js nav CSS).
- [ ] Expand behavior-based marketing automations ("Support the ministry" banner for radio listeners, repeat-visitor popups).
- [ ] Replace placeholder images in `/ai-art` gallery (waiting on user images).

### P3
- [ ] Refactor `BookOfAmos.js` (>2580 lines) → move arrays to JSON files.
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
    └── pages/BookOfAmos.js  (now 2581 lines)
```

## Credentials
- Admin/Paywall bypass: `RJHNSN12admin2026` (stored in `localStorage.admin_ai_access`).
