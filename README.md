# VOCIS

The public site for VOCIS, at [vocisgroup.com](https://vocisgroup.com).

One page, three sections, no build step. Plain HTML, CSS and JavaScript, served as-is by Cloudflare.

## Where things live

Everything the public sees is in `public/`. Files at the repo root (this README, `wrangler.jsonc`) are never served.

| What | File |
|---|---|
| All copy | `public/index.html`, one block per section (`#studio`, `#capabilities`, `#principles`, `#approach`, `#contact`) |
| Colors, type, layout, motion | `public/assets/css/site.v2.css`, with the brand palette tokens under `:root` |
| Hero gradient and grain, menu, scroll behavior | `public/assets/js/site.v2.js` |
| 404 page | `public/404.html` |
| Fonts (Cormorant Garamond and Lato, self-hosted) | `public/assets/fonts/` |
| Photos, gradients, logos, share image and icons | `public/img/`, `public/favicon.ico` |
| Security and cache headers | `public/_headers` |
| Cloudflare deploy settings | `wrangler.jsonc` |

## Editing copy

Open `public/index.html`, change the text, and commit to `main`. Cloudflare deploys within a minute or two. Keep curly apostrophes (’) to match the typography.

## Editing CSS or JS

CSS and JS are cached for a year, so a change needs a new filename:

1. Rename the file, e.g. `site.v2.css` → `site.v3.css`.
2. Update its `<link>` or `<script>` tag in `public/index.html` (and the stylesheet link in `public/404.html`).

HTML revalidates on every request, so visitors pick up the new files straight away.

## No inline code

The security policy in `public/_headers` allows scripts and styles only from the site's own files. Keep all CSS in `public/assets/css/` and all JavaScript in `public/assets/js/`; a `<style>` or `<script>` block written into the HTML will be blocked.

## Preview locally

```sh
cd public && python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying on Cloudflare

The domain's DNS must be on Cloudflare (nameservers pointed at Cloudflare).

1. **Connect the repo.** In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**, and pick this repo. Leave the build command empty. The deploy command is `npx wrangler deploy`, which reads `wrangler.jsonc` and serves `public/`.
   *Using Cloudflare Pages instead also works: leave the build command empty and set the build output directory to `public`.*
2. **Add the domains.** In the project's **Settings → Domains & Routes**, add `vocisgroup.com` and `www.vocisgroup.com` as custom domains.
3. **Redirect www to the bare domain.** Under the zone's **Rules → Redirect Rules**, use the "Redirect from WWW to root" template (301, preserve path and query).
4. **Force HTTPS.** Under **SSL/TLS → Edge Certificates**, turn on **Always Use HTTPS**.
5. **Keep Cloudflare from injecting scripts.** The CSP blocks anything the site didn't ship, so leave these off: Rocket Loader, Email Address Obfuscation, Zaraz, and automatic Web Analytics injection. If any are on, the browser console will show CSP errors.

## Principles

- Palette tokens only. No new colors.
- No trackers, analytics, cookies or third-party requests. The CSP enforces this.
- Respect `prefers-reduced-motion`. The site must look intentional with JavaScript off.
- Keep total page weight under 300 KB (currently about 100 KB).

## Licenses

Cormorant Garamond and Hanken Grotesk are under the SIL Open Font License; see `public/assets/fonts/OFL-*.txt`.
