# Portfolio — Tejasri Kopparthi

Personal portfolio site for Tejasri Kopparthi, Software Engineer II (Backend Systems & Applied AI),
based in Seattle, WA. Showcases four projects — TriagePilot, CodeCompass, SecureFlow, A11yGuard —
with **live interactive demos** on the site itself.

Note: the four project source repos are private (available on request). The site therefore
contains no links to private repos — instead each project card links to its live demo section,
and the A11yGuard demo embeds the actual before/after demo app.

## Tech

Pure static site — `index.html`, `styles.css`, `app.js`, plus `demos/` (demo data captured from
real project runs, and the embedded A11yGuard before/after app). No build step, no frameworks,
no dependencies except the Mermaid CDN (used to render one pipeline diagram; the page works
without it, showing the diagram source).

System font stack, dark theme, mobile-first responsive design.

## Contents

- `index.html` — hero, projects, live demos, about, contact
- `styles.css` — dark theme + demo styles
- `app.js` — mobile nav, step-through demo controllers, A11yGuard tabs
- `demos/triage-data.js` — real TriagePilot transcripts (3 incidents, captured from actual runs)
- `demos/codecompass-data.js` — real CodeCompass sessions (3 questions, transcribed from the README)
- `demos/a11y/before/`, `demos/a11y/after/` — the actual A11yGuard demo app, both versions
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Local preview

```bash
cd ~/workspace/projects/portfolio-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment (GitHub Pages)

Deployed to **https://tejasri21.github.io/** via GitHub Pages:

1. Push this directory's contents to the root of the `Tejasri21.github.io` repository on GitHub
   (a repo named exactly `<username>.github.io` is served automatically; it can be public
   even though the project source repos are private).
2. In the repo's **Settings → Pages**, set **Source** to **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
3. The site goes live at https://tejasri21.github.io/ within a minute or two of pushing.

To update: edit the files, commit, and push — Pages redeploys automatically.
