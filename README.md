# BEFORE 24.02

Museum/gallery-style website for the BEFORE 24.02 archival AI portrait project.

## Deployment target
Cloudflare Pages.

Recommended Pages settings:
- Production branch: `main`
- Framework preset: None
- Build command: leave empty
- Build output directory: `/` (repository root)

The `functions/` directory contains the inquiry endpoint for Cloudflare Pages Functions.

## Inquiry delivery
The form posts privately to `/api/inquiry` and is prepared to send through Resend. Configure these environment variables in Cloudflare Pages before enabling live inquiries:
- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL`
- `INQUIRY_FROM_EMAIL`

## Editorial model
Archive first, market second. No public prices, wallet-connect, floor charts, tokenomics, countdowns, analytics or crypto-market widgets.

## Media
Artwork media currently loads from the OpenSea/Seadn URLs preserved in the provenance data. A later museum/archive release should self-host immutable originals and publish SHA-256 media hashes.
