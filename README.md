# VOCIS

The public site for VOCIS, at [vocisgroup.com](https://vocisgroup.com).

One page, three sections, no build step. Plain HTML, CSS and JavaScript, served as-is by Netlify.

## Where things live

| What | File |
|---|---|
| All copy | `index.html`, one block per section (`#about`, `#thesis`, `#services`) |
| Colors, type, layout, motion | `assets/css/main.v1.css`, with the palette tokens at the top under `:root` |
| Hero light field, load sequence, scroll reveals | `assets/js/main.v1.js` |
| 404 page | `404.html` |
| Fonts (self-hosted, Latin subset) | `assets/fonts/` |
| Share image and icons | `assets/img/`, `favicon.ico` |
| Hosting, redirects, security and cache headers | `netlify.toml` |

## Editing copy

Open `index.html`, change the text, commit to `main`. Netlify deploys within a minute. Keep curly apostrophes (’) to match the typography.

## Editing CSS or JS

CSS and JS are cached for a year, so a change needs a new filename:

1. Rename the file, e.g. `main.v1.css` → `main.v2.css`.
2. Update its `<link>` or `<script>` tag in `index.html` (and the stylesheet link in `404.html`).

HTML is never cached, so visitors pick up the new files straight away.

## The inline script

`index.html` has one inline line in the `<head>` that adds a `js` class before first paint, so the load sequence doesn't flash. The Content Security Policy in `netlify.toml` allows it by hash. If you change that line, regenerate the hash and update `netlify.toml`:

```sh
printf '%s' 'document.documentElement.className+=" js"' | openssl dgst -sha256 -binary | base64
```

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

1. In Netlify: **Add new site → Import an existing project**, and pick this repository.
2. Leave the build command empty and set the publish directory to `.` (both are already in `netlify.toml`).
3. **Domain management:** add `vocisgroup.com` as the primary domain and `www.vocisgroup.com` as an alias, then point DNS at Netlify. HTTPS is issued automatically, and `netlify.toml` redirects www and http to `https://vocisgroup.com`.
4. Pull requests get deploy previews automatically.

## Principles

- Palette tokens only. No new colors.
- No trackers, analytics, cookies or third-party requests. The CSP enforces this.
- Respect `prefers-reduced-motion`. The site must look intentional with JavaScript off.
- Keep total page weight under 300 KB (currently about 100 KB).

## Licenses

Cormorant Garamond and Hanken Grotesk are under the SIL Open Font License; see `assets/fonts/OFL-*.txt`.
