# 🎨 AI Image Generation — Mandatory Style Guide (Richard Johnson's Requirements)

This file is the **AUTHORITATIVE** reference for any AI-generated image depicting biblical figures on this platform. Every agent MUST follow these rules without deviation. This reflects Richard Johnson's theological and historical research perspective on the true identities of biblical figures.

## CORE RULE: Historical Accuracy Per Richard's Research

**All biblical figures must be depicted as BLACK (dark-skinned) people with LOCKS (dreadlocks) dressed in ancient EGYPTIAN attire** — consistent with the Pharaoh Thutmose III reference image generated on 2026-02-20.

### Specifically:
- **Moses** → Black man, locks in hair, dressed as an Egyptian (Nemes headdress or equivalent royal garb)
- **David** → Black man, locks in hair, dressed as an Egyptian
- **Solomon, Amos, Daniel, Isaiah, Ezekiel, all prophets and kings** → same aesthetic: Black, locks, Egyptian attire
- **Abraham, Isaac, Jacob, the Patriarchs** → same aesthetic

### What NEVER to generate:
- ❌ White/European-looking biblical figures
- ❌ Medieval/Renaissance-European artistic depictions
- ❌ Biblical figures in Greek/Roman togas or generic "robed man" styling
- ❌ Blonde/red-haired biblical figures
- ❌ Biblical figures with straight or short Western-style hair

## Style Template (from the successful Tutmoses cover):

```
A regal, majestic portrait of [FIGURE NAME] depicted as a strong, dignified BLACK man with LOCKS (dreadlocks) in his hair, wearing traditional ancient EGYPTIAN attire — 
- Nemes striped headdress with golden Uraeus serpent on forehead (for kings/pharaohs)
- OR priestly Egyptian robes with lapis lazuli and gold accents (for priests/prophets)
- Royal Egyptian broad collar necklace (Usekh) made of lapis lazuli, gold, and turquoise
- Crook and flail, or staff, or relevant biblical prop

Dark skin tone, piercing eyes, strong dignified face.
Background: Egyptian temple hieroglyphics, golden-brown desert hues, torch-lit warm atmosphere.
Cinematic lighting, painterly oil-painting style with rich textures, museum-quality artwork.
Portrait composition suitable for book covers (6x9 vertical ratio).
No modern elements. No Europeanized features.
```

## Reference Image
`/app/backend/generated_images/tutmoses_book_cover.png` — the established baseline aesthetic.

## User Intent Quote
> "If I do a picture of Moses, he would be a black person with locks in his hair, dressed as an Egyptian. David — we have locks in his hair, dressed as an Egyptian, just like the image you just seen for Tutu Mouse."
> — Richard Johnson, 2026-02-20

## Enforcement
- Any AI image generation call for biblical figures MUST inject these style requirements into the prompt.
- If a user (including Richard) requests a biblical figure without specifying style, DEFAULT to this aesthetic automatically.
- Do NOT ask "what style do you want" for biblical figures — this is settled.
