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

All page content lives in plain text files under [`content/`](content/) — one file per
section. Edit those files (never `index.html`); the page loads them in the browser and
renders them into the design automatically. Each file has comments at the top explaining
its fields.

| Section | File |
|---|---|
| About | [`content/about.yml`](content/about.yml) |
| KINGS | [`content/kings.yml`](content/kings.yml) |
| Research | [`content/research.yml`](content/research.yml) |
| Codes | [`content/codes.yml`](content/codes.yml) |
| SMR | [`content/smr.yml`](content/smr.yml) |
| People | [`content/people.yml`](content/people.yml) |
| Publications | [`content/publications.yml`](content/publications.yml) |
| Teaching | [`content/teaching.yml`](content/teaching.yml) |
| Contact | [`content/contact.yml`](content/contact.yml) |

Common tasks:

- **Change text:** edit the value after a field (e.g. `heading:`, `bio:`, `desc:`).
  Text fields accept **Markdown** (`**bold**`, `*italic*`, `[link](url)`).
- **Add an item** (person, code, paper, course…): copy an existing `- ` block and fill it
  in. Keep the 2-space indentation.
- **Add / replace an image:** put the file in `assets/img/`, then write just its file name
  (e.g. `photo: kim.jpg` or `src: core.jpg`). Images are resized to fit automatically.
  A full path or URL also works.
- **Change a layout:** many sections accept `columns: N` (1–4) to set the grid — e.g.
  `columns: 2` gives a 2-across layout. Omit it for the responsive default.

The nav bar, hero banner, and footer are design elements and stay in `index.html`.

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
