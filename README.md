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

## Editing content (no HTML needed)

Content is being moved out of `index.html` into plain text files under `content/`,
so you can update the site without touching HTML or CSS. The page loads these files
in the browser and renders them into the design automatically.

**People** — edit [`content/people.yml`](content/people.yml):

- **Change a name/role/bio:** edit the text after `name:`, `role:`, `bio:`.
- **Add a person:** copy a `- name:` block (keep the 2-space indentation) and fill it in.
- **Add a photo:** put the image file in `assets/img/`, then set `photo: yourfile.jpg`.
  Leave `photo` out and the site shows the person's initials instead.
- **Add/rename a group** (e.g. "Postdocs"): copy a `- label:` block.

Other sections (Codes, Publications, About, …) will follow the same pattern.

## Local preview

The page fetches files from `content/`, so it must be served over HTTP — opening
`index.html` directly (as a `file://`) will show a load error. Run a local server:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Custom domain (rpl.kings.ac.kr)

The site is live immediately at `dnegri.github.io/rpl`. To serve it at
`rpl.kings.ac.kr` instead:

1. Add a `CNAME` file to the repo root containing `rpl.kings.ac.kr`.
2. In the KINGS DNS zone, add a `CNAME` record: `rpl` → `dnegri.github.io`.
3. In the repo's **Settings → Pages**, set the custom domain and enable
   *Enforce HTTPS*.

DNS is controlled by the university, so step 2 requires KINGS IT.
