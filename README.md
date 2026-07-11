# RPL — Reactor Physics & Computational Analysis Laboratory

Website for the **Reactor Physics & Computational Analysis Laboratory (RPL)** at
KINGS (KEPCO International Nuclear Graduate School), Ulsan, Korea — led by
Prof. Joo-il Yoon.

**Live:** https://dnegri.github.io/rpl/

The site introduces the lab's in-house reactor-core simulation codes (SPHINCS,
MONTEX, CROMA, HYBRID, VENUS, HEXANUS, CYNUS), the PWR two-step code system,
SMR core-design work, people, publications, and teaching.

## Stack

A single self-contained static page — `index.html` with inline CSS/JS, no build
step. Typography uses the IBM Plex superfamily (served via Google Fonts).
Deployed with **GitHub Pages** (serves `index.html` from the `main` branch root).

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

or just open `index.html` in a browser.

## Custom domain (rpl.kings.ac.kr)

The site is live immediately at `dnegri.github.io/rpl`. To serve it at
`rpl.kings.ac.kr` instead:

1. Add a `CNAME` file to the repo root containing `rpl.kings.ac.kr`.
2. In the KINGS DNS zone, add a `CNAME` record: `rpl` → `dnegri.github.io`.
3. In the repo's **Settings → Pages**, set the custom domain and enable
   *Enforce HTTPS*.

DNS is controlled by the university, so step 2 requires KINGS IT.
