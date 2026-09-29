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

**Single-file sections** — one file holds the whole section:

| Section | File |
|---|---|
| About | [`content/about.yml`](content/about.yml) |
| KINGS | [`content/kings.yml`](content/kings.yml) |
| SMR | [`content/smr.yml`](content/smr.yml) |
| Contact | [`content/contact.yml`](content/contact.yml) |

**Collections** — one file *per item*, so you edit just the item you want. Each folder has
a small `_index.yml` (section heading + the display `order`) and one `.md` file per item:

| Section | Folder | One file per… |
|---|---|---|
| Research | [`content/research/`](content/research/) | research area |
| Codes | [`content/codes/`](content/codes/) | code (e.g. `sphincs.md`) |
| People | [`content/people/`](content/people/) | person (e.g. `kim.md`) |
| Publications | [`content/publications/`](content/publications/) | paper |
| Teaching | [`content/teaching/`](content/teaching/) | course |

Each item file is Markdown with a small header (the fields) and a body (the prose):

```markdown
---
name: Jin-sun Kim
role: Ph.D. Student
group: Ph.D. Students
photo: kim.jpg
---
Advanced core design & reactivity control for PWRs and i-SMRs.
```

Common tasks:

- **Edit one item:** open its `.md` file and change the header fields or the body text.
  That single file is all you touch.
- **Add an item:** create a new `.md` file in the folder (copy an existing one), then add
  its file name to the `order:` list in that folder's `_index.yml` (this sets the order).
- **Remove / reorder items:** edit the `order:` list in `_index.yml`.
- **Add / replace an image:** put the file in `assets/img/`, then write just its file name
  (e.g. `photo: kim.jpg` or `src: core.jpg`). Images are resized to fit automatically.
  A full path or URL also works.
- **Change a layout:** collections/sections accept `columns: N` (1–4) — e.g. `columns: 2`
  gives a 2-across grid. Omit it for the responsive default. Text fields accept **Markdown**.

The nav bar, hero banner, and footer are design elements and stay in `index.html`.

## Local preview

The page fetches files from `content/`, so it must be served over HTTP — opening
`index.html` directly (as a `file://`) will show a load error. Run a local server:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Content management (admin UI)

Editors use Sveltia CMS at `/admin/` (e.g. `https://dnegri.github.io/rpl/admin/`)
instead of hand-editing files. Every save is a git commit, so any change can be
reverted with `git revert`.

**Sign-in.** Click "Sign in with Token" and paste a GitHub personal access token:
a fine-grained token scoped to this repo with **Contents read/write** (a classic
token needs the `repo` scope). The token stays in the editor's own browser.

Shared-token shortcut: the admin may issue one repo-scoped token and share the
string privately with editors like a password. Caveats: it is a shared secret,
all commits carry one author, and staff changes mean rotating it. Never commit a
token to the repo or bake one into a page.

**Workflows.**

- New items (researcher, paper, …) must also be added to that collection's
  *Display order* list under *Ordering & labels* — otherwise they exist but do
  not render. Same for deletes: remove the file entry from the order list.
- Uploaded photos land in `assets/img/` and are referenced automatically.
- Journey hero: text and stills are free to change; clips form a
  frame-identical chain — swap them only as a tested set (see the warning at
  the top of `content/journey.yml`).

**Local test.** Run the server above, open `/admin/index.html` in Chromium,
choose "Work with Local Repository", and pick the repo root. Edits hit local
files; review with `git diff`, then commit and push.

## Custom domain (rpl.kings.ac.kr)

The site is live immediately at `dnegri.github.io/rpl`. To serve it at
`rpl.kings.ac.kr` instead:

1. Add a `CNAME` file to the repo root containing `rpl.kings.ac.kr`.
2. In the KINGS DNS zone, add a `CNAME` record: `rpl` → `dnegri.github.io`.
3. In the repo's **Settings → Pages**, set the custom domain and enable
   *Enforce HTTPS*.

DNS is controlled by the university, so step 2 requires KINGS IT.
