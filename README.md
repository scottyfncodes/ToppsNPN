# Topps Access Finder

A free, mobile-first web app for baseball card collectors to discover currently
eligible Topps Access / No Purchase Necessary products, see exact entry
requirements and deadlines, and generate a print-ready mail-in submission
packet.

**Topps Access Finder is an independent collector utility and is not
affiliated with or endorsed by Topps.** It's a convenience/organization tool —
it does not process entries, guarantee cards, or imply any submission wins.

**Live site:** https://scottyfncodes.github.io/ToppsNPN/ (deployed automatically
by `.github/workflows/deploy-pages.yml` on every push — see "Deploying" below).

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- jsPDF (lazy-loaded, only downloaded when a user generates an entry)
- LocalStorage for the user's mailing profile and entry tracker (no backend, no accounts)

## Running locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build
```

## Updating product data

All product data lives in **`src/data/products.ts`** as a plain TypeScript
array conforming to the `Product` type in `src/types.ts`. There's no build
step or database — edit the array directly (or swap it for a fetch from a
JSON file/CMS later without touching any UI code).

**Every record currently in that file is placeholder/sample data**, clearly
marked with `isPlaceholder: true` and names/URLs pointing at
`example-placeholder.test` so they can never be mistaken for real Topps
information. To go live with a product:

1. Confirm every field directly against an official Topps source (product
   page, official rules, checklist, submission instructions).
2. Copy the **exact eligible product name** verbatim from the official
   rules — never abbreviate or reword it. This is the single most important
   field: an incorrect name can invalidate a real entry.
3. Set `entryWindowDays` (preferred) so the deadline is computed from the
   release date, or `entryDeadlineOverride` if the rules specify a fixed
   calendar date instead.
4. Fill in `submissionAddress`, `officialRulesUrl`, `officialChecklistUrl`,
   `officialSubmissionFormUrl`, `envelopeRequirements`, and
   `handwrittenRequirements` from the official rules.
5. Set `lastVerified` to the date you checked, and `isPlaceholder: false`.
6. Leave anything you can't verify as `null`. The app will show
   "Not yet verified" / "⚠️ Verification Required" instead of guessing — never
   fill in a value you aren't sure of.

Status (`OPEN` / `CLOSING SOON` / `CLOSED` / `UPCOMING` /
`VERIFICATION REQUIRED`) and days-remaining countdowns are always computed
from these dates in `src/lib/deadline.ts` — they are never hard-coded.

## Deploying

The app deploys to GitHub Pages automatically via
`.github/workflows/deploy-pages.yml` on every push to
`claude/topps-access-finder-xdw6fj`. It builds with Vite (base path
`/ToppsNPN/`) and publishes `dist/` using GitHub's official
`actions/upload-pages-artifact` + `actions/deploy-pages`.

**One-time setup required in the repo:** GitHub Pages must be switched to
"GitHub Actions" as its source before the workflow's first deploy will
succeed — Settings → Pages → Build and deployment → Source → GitHub Actions.
This can't be done from a workflow file; it's a one-time manual toggle in the
repo settings.

Two things make client-side routing work correctly on GitHub Pages' static
hosting:

- `vite.config.ts` sets `base: '/ToppsNPN/'` for production builds (dev stays
  at `/`), and `src/main.tsx` passes that same value to `BrowserRouter` as
  `basename` so routes resolve under the subpath.
- `public/404.html` implements the standard
  [spa-github-pages](https://github.com/rafgraph/spa-github-pages) redirect
  trick: GitHub Pages serves that file's content (with an HTTP 404 status) for
  any unmatched path, e.g. a bookmarked or refreshed `/product/:id` link.
  Its script stashes `location.href` in `sessionStorage` and redirects to the
  app root; an inline script in `index.html` restores the real URL via
  `history.replaceState` before the router mounts, so the correct page
  renders. If you ever move the app off the `/ToppsNPN/` GitHub Pages
  subpath, update the hard-coded path in `public/404.html` to match.

## Architecture notes

- `src/types.ts` — data model. `Sport` is a plain string union so new sports
  are just new data, never new code paths.
- `src/data/products.ts` — the product database (see above).
- `src/lib/deadline.ts` — pure functions for computing deadlines, status, and
  countdown labels from product data and the current date.
- `src/lib/storage.ts` — LocalStorage read/write for the user's mailing
  profile and entry tracker. Nothing here ever leaves the device.
- `src/lib/pdf.ts` — generates the printable entry cover sheet and the
  multi-product "print all open" packet.
- `src/hooks/useProducts.ts` — combines the product database with computed
  status for the UI.

The data layer is intentionally decoupled from the UI so a real backend
(accounts, cloud sync, scraped/official Topps data feed) can replace
`src/data/products.ts` and `src/lib/storage.ts` later without touching
components or pages.
