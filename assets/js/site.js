/* RPL site renderer — turns content/*.yml files into the page.
   No build step: the browser loads the content files and renders them into the
   existing design. Edit the files in content/, not this file.

   Conventions used in the content files:
   • Images: write just a file name (e.g. photo: core.jpg) and it is loaded from
     assets/img/. A full path or URL is used as-is. Images auto-fit their column.
   • Prose fields (body, intro, desc, caption, meta …) accept **Markdown**.
   • Card sections accept an optional  columns: N  to set the layout (1, 2, 3, 4).
*/
(function (root) {
  "use strict";

  var yaml = root.jsyaml;
  var marked = root.marked;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function md(s) { return s ? marked.parse(String(s)) : ""; }
  function mdi(s) { return s ? marked.parseInline(String(s)) : ""; }

  // Resolve an image reference: bare file name -> assets/img/, path/URL as-is.
  function imgSrc(s) {
    s = String(s || "");
    return (/^(https?:)?\/\//.test(s) || s.charAt(0) === "/" || s.indexOf("/") >= 0) ? s : "assets/img/" + s;
  }

  function initials(name) {
    var parts = String(name || "").replace(/^(Prof\.?|Dr\.?)\s+/i, "").split("·")[0].trim().split(/\s+/);
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }

  function head(d) {
    return (d.kicker ? '<p class="kicker">' + esc(d.kicker) + "</p>" : "") +
           (d.heading ? "<h2>" + mdi(d.heading) + "</h2>" : "") +
           (d.intro ? '<p class="intro">' + mdi(d.intro) + "</p>" : "");
  }

  // Open a card grid: default responsive class, or a fixed column count.
  function gridOpen(defaultClass, columns) {
    return columns ? '<div class="gcols" style="--cols:' + (+columns) + '">' : '<div class="' + defaultClass + '">';
  }

  function figure(fig) {
    if (!fig) return "";
    if (typeof fig === "string") fig = { src: fig };
    return '<figure class="figure' + (fig.pad ? " pad" : "") + '">' +
      '<img src="' + esc(imgSrc(fig.src)) + '" alt="' + esc(fig.alt || fig.caption || "") + '" loading="lazy">' +
      (fig.caption ? "<figcaption>" + mdi(fig.caption) + "</figcaption>" : "") + "</figure>";
  }
  function figures(list, columns) {
    if (!list || !list.length) return "";
    var inner = list.map(figure).join("");
    var cols = columns || (list.length > 1 ? list.length : 1);
    return list.length > 1
      ? '<div class="gcols" style="--cols:' + (+cols) + ';margin-top:16px">' + inner + "</div>"
      : inner;
  }

  // ---- section renderers ---------------------------------------------------

  function renderAbout(d) { return head(d) + (d.body ? '<div class="prose">' + md(d.body) + "</div>" : ""); }

  function renderKings(d) {
    return head(d) +
      '<div class="kings-grid">' +
        '<div class="kings-photo"><img src="' + esc(imgSrc(d.photo)) + '" alt="' + esc(d.photo_alt || "KINGS campus") + '" loading="lazy">' +
          (d.caption ? '<span class="cred">' + esc(d.caption) + "</span>" : "") + "</div>" +
        '<div class="kings-copy">' + md(d.body) +
          (d.facts && d.facts.length ? '<div class="kings-facts">' + d.facts.map(function (f) {
            return '<div class="kf"><b>' + esc(f.value) + "</b><span>" + esc(f.label) + "</span></div>";
          }).join("") + "</div>" : "") +
        "</div>" +
      "</div>";
  }

  function renderResearch(d) {
    var cards = (d.cards || []).map(function (c, i) {
      return '<div class="rcard">' + (c.n || c.n === 0 || true ? '<div class="rn">' + esc(c.n != null ? c.n : ("0" + (i + 1)).slice(-2)) + "</div>" : "") +
        "<h3>" + mdi(c.title) + "</h3><p>" + mdi(c.body) + "</p></div>";
    }).join("");
    return head(d) + gridOpen("rgrid", d.columns) + cards + "</div>" + figure(d.figure);
  }

  function badgeClass(status) {
    var s = String(status || "").toLowerCase();
    if (s.indexOf("matur") >= 0) return "m";
    if (s.indexOf("develop") >= 0 || s.indexOf("prototype") >= 0) return "d";
    return "a";
  }
  function codeCard(c) {
    return '<div class="ccard">' +
      '<div class="top"><span class="name">' + esc(c.name) + "</span>" +
        (c.status ? '<span class="badge ' + badgeClass(c.status) + '">' + esc(c.status) + "</span>" : "") + "</div>" +
      (c.exp ? '<div class="exp">' + mdi(c.exp) + "</div>" : "") +
      (c.desc ? '<div class="desc">' + mdi(c.desc) + "</div>" : "") +
      (c.tags && c.tags.length ? '<div class="tags">' + c.tags.map(function (t) {
        return '<span class="tag">' + esc(t) + "</span>";
      }).join("") + "</div>" : "") + "</div>";
  }
  function renderCodes(d) {
    var pipe = "";
    if (d.pipeline && d.pipeline.length) {
      pipe = '<div class="pipe">' + d.pipeline.map(function (n, i) {
        var cls = n.kind === "mid" ? "node mid" : n.kind === "out" ? "node out" : "node";
        var node = '<div class="' + cls + '"><div class="lab">' + esc(n.label) + "</div>" +
          (n.sub ? '<div class="sub">' + esc(n.sub) + "</div>" : "") + "</div>";
        return (i ? '<div class="arrow">──▶</div>' : "") + node;
      }).join("") + "</div>";
    }
    var groups = (d.groups || []).map(function (g) {
      return '<div class="grouplbl">' + esc(g.label) + "</div>" +
        gridOpen("cgrid", g.columns || d.columns) + (g.codes || []).map(codeCard).join("") + "</div>";
    }).join("");
    return head(d) + pipe +
      (d.pipeline_note ? '<p class="pipe-note">' + mdi(d.pipeline_note) + "</p>" : "") +
      figure(d.figure) + groups +
      (d.foundation ? '<p class="found">' + mdi(d.foundation) + "</p>" : "");
  }

  function renderSMR(d) {
    var boxes = (d.boxes || []).map(function (b) {
      return '<div class="fbox"><h3>' + mdi(b.title) + "</h3>" +
        (b.subtitle ? '<p class="fsub">' + mdi(b.subtitle) + "</p>" : "") +
        '<div class="specs">' + (b.specs || []).map(function (r) {
          return '<div class="row"><span class="k">' + esc(r.k) + '</span><span class="v">' + esc(r.v) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
    return head(d) + '<div class="feat">' + boxes + "</div>" + figures(d.figures, d.figures_columns);
  }

  function personCard(p) {
    var av = p.photo
      ? '<img class="avatar" src="' + esc(imgSrc(p.photo)) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<div class="mono">' + esc(initials(p.name)) + "</div>";
    return '<div class="pcard">' + av + '<div class="pbody">' +
      '<div class="pn">' + esc(p.name) + "</div>" +
      (p.role ? '<div class="pr">' + esc(p.role) + "</div>" : "") +
      (p.affiliation ? '<div class="paff">' + esc(p.affiliation) + "</div>" : "") +
      (p.bio ? '<div class="pf">' + mdi(p.bio) + "</div>" : "") + "</div></div>";
  }
  function renderPeople(d) {
    var pi = d.pi ? '<div class="pi-feature">' +
      (d.pi.photo ? '<img class="pi-photo" src="' + esc(imgSrc(d.pi.photo)) + '" alt="' + esc(d.pi.name) + '" loading="lazy">' : "") +
      "<div>" +
        '<div class="pn">' + esc(d.pi.name) + "</div>" +
        (d.pi.role ? '<div class="pr">' + esc(d.pi.role) + "</div>" : "") +
        (d.pi.affiliation ? '<div class="paff">' + esc(d.pi.affiliation) + "</div>" : "") +
        (d.pi.bio ? '<p class="pbio">' + mdi(d.pi.bio) + "</p>" : "") +
        (d.pi.email ? '<div class="pmail"><a href="mailto:' + esc(d.pi.email) + '">' + esc(d.pi.email) + "</a></div>" : "") +
      "</div></div>" : "";
    var groups = (d.groups || []).map(function (g) {
      return '<div class="pgroup"><p class="glab">' + esc(g.label) + '</p>' +
        gridOpen("pgrid", g.columns) + (g.people || []).map(personCard).join("") + "</div></div>";
    }).join("");
    return head(d) + pi + groups;
  }

  function renderPubs(d) {
    var metrics = (d.metrics && d.metrics.length) ? '<div class="pubmetrics">' + d.metrics.map(function (m) {
      return '<div class="m"><b>' + esc(m.value) + "</b><span>" + esc(m.label) + "</span></div>";
    }).join("") + "</div>" : "";
    var list = '<div class="publist">' + (d.items || []).map(function (p) {
      return '<div class="pub"><div class="yr">' + esc(p.year) + "</div><div>" +
        '<p class="pt">' + mdi(p.title) + "</p>" +
        (p.meta ? '<div class="pmeta">' + mdi(p.meta) + "</div>" : "") + "</div></div>";
    }).join("") + "</div>";
    return head(d) + metrics + list + (d.note ? '<p class="pubmore">' + mdi(d.note) + "</p>" : "");
  }

  function renderTeaching(d) {
    var cards = (d.courses || []).map(function (c) {
      return '<div class="tcard"><h3>' + mdi(c.title) + "</h3><p>" + mdi(c.body) + "</p></div>";
    }).join("");
    return head(d) + gridOpen("tgrid", d.columns) + cards + "</div>";
  }

  function renderContact(d) {
    var addr = '<div class="cbox"><p class="clab">' + esc(d.address_label || "Address") + "</p><address>" +
      (d.address_title ? '<span class="big">' + esc(d.address_title) + "</span><br>" : "") +
      (d.address || []).map(esc).join("<br>") + "</address></div>";
    var det = '<div class="cbox"><p class="clab">' + esc(d.details_label || "Get in touch") + "</p>" +
      (d.details || []).map(function (r) {
        var val = r.href ? '<a href="' + esc(r.href) + '">' + esc(r.v) + "</a>" : esc(r.v);
        return '<div class="cline"><span class="k">' + esc(r.k) + "</span><span>" + val + "</span></div>";
      }).join("") + "</div>";
    return head(d) + '<div class="cwrap">' + addr + det + "</div>";
  }

  // ---- per-item collections (folder of files + _index.yml) -----------------

  function parseFrontMatter(text) {
    var m = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text || "");
    if (!m) return { body: String(text || "").trim() };
    var data = yaml.load(m[1]) || {};
    data.body = (m[2] || "").trim();
    return data;
  }

  function loadCollection(dir) {
    return fetch(dir + "/_index.yml")
      .then(function (r) { if (!r.ok) throw new Error(r.status + " " + dir + "/_index.yml"); return r.text(); })
      .then(function (t) {
        var index = yaml.load(t) || {};
        return Promise.all((index.order || []).map(function (fn) {
          return fetch(dir + "/" + fn)
            .then(function (r) { if (!r.ok) throw new Error(r.status + " " + fn); return r.text(); })
            .then(parseFrontMatter);
        })).then(function (items) { return { index: index, items: items }; });
      });
  }

  function byGroups(items, groupOrder, mapFn) {
    var buckets = {};
    items.forEach(function (it) { (buckets[it.group] = buckets[it.group] || []).push(mapFn(it)); });
    var order = groupOrder || Object.keys(buckets);
    return order.filter(function (l) { return buckets[l]; }).map(function (l) { return { label: l, items: buckets[l] }; });
  }

  function assemblePeople(index, items) {
    var pi = null;
    var rest = items.filter(function (it) { if (it.pi) { pi = it; return false; } return true; });
    var groups = byGroups(rest, index.groups, function (it) {
      return { name: it.name, role: it.role, affiliation: it.affiliation, photo: it.photo, bio: it.body };
    }).map(function (g) { return { label: g.label, people: g.items }; });
    var piObj = pi ? { name: pi.name, role: pi.role, affiliation: pi.affiliation, photo: pi.photo, email: pi.email, bio: pi.body } : null;
    return { kicker: index.kicker, heading: index.heading, pi: piObj, groups: groups };
  }
  function assembleResearch(index, items) {
    return { kicker: index.kicker, heading: index.heading, intro: index.intro, columns: index.columns, figure: index.figure,
      cards: items.map(function (it) { return { title: it.title, body: it.body, n: it.n }; }) };
  }
  function assembleCodes(index, items) {
    var groups = byGroups(items, index.groups, function (it) {
      return { name: it.name, status: it.status, exp: it.exp, tags: it.tags, desc: it.body };
    }).map(function (g) { return { label: g.label, columns: index.columns, codes: g.items }; });
    return { kicker: index.kicker, heading: index.heading, intro: index.intro, pipeline: index.pipeline,
      pipeline_note: index.pipeline_note, figure: index.figure, foundation: index.foundation, groups: groups };
  }
  function assemblePubs(index, items) {
    return { kicker: index.kicker, heading: index.heading, metrics: index.metrics, note: index.note,
      items: items.map(function (it) { return { year: it.year, title: it.body, meta: it.meta }; }) };
  }
  function assembleTeaching(index, items) {
    return { kicker: index.kicker, heading: index.heading, columns: index.columns,
      courses: items.map(function (it) { return { title: it.title, body: it.body }; }) };
  }

  // Single-file sections use {file, render}; collections use {dir, assemble, render}.
  var config = {
    "about-root": { file: "content/about.yml", render: renderAbout },
    "kings-root": { file: "content/kings.yml", render: renderKings },
    "smr-root": { file: "content/smr.yml", render: renderSMR },
    "contact-root": { file: "content/contact.yml", render: renderContact },
    "research-root": { dir: "content/research", assemble: assembleResearch, render: renderResearch },
    "codes-root": { dir: "content/codes", assemble: assembleCodes, render: renderCodes },
    "people-root": { dir: "content/people", assemble: assemblePeople, render: renderPeople },
    "publications-root": { dir: "content/publications", assemble: assemblePubs, render: renderPubs },
    "teaching-root": { dir: "content/teaching", assemble: assembleTeaching, render: renderTeaching }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      renderAbout: renderAbout, renderKings: renderKings, renderResearch: renderResearch,
      renderCodes: renderCodes, renderSMR: renderSMR, renderPeople: renderPeople,
      renderPubs: renderPubs, renderTeaching: renderTeaching, renderContact: renderContact,
      parseFrontMatter: parseFrontMatter, assemblePeople: assemblePeople, assembleResearch: assembleResearch,
      assembleCodes: assembleCodes, assemblePubs: assemblePubs, assembleTeaching: assembleTeaching,
      imgSrc: imgSrc, initials: initials, esc: esc, _setLibs: function (y, mk) { yaml = y; marked = mk; }
    };
  }

  if (typeof document !== "undefined") {
    var run = function () {
      Object.keys(config).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var c = config[id];
        var p = c.dir
          ? loadCollection(c.dir).then(function (o) { return c.render(c.assemble(o.index, o.items)); })
          : fetch(c.file).then(function (r) { if (!r.ok) throw new Error(r.status + " " + c.file); return r.text(); })
              .then(function (t) { return c.render(yaml.load(t) || {}); });
        p.then(function (html) { el.innerHTML = html; })
         .catch(function (err) {
            el.innerHTML = '<p style="color:var(--copper)">Content failed to load (' + esc(err.message) +
              "). If previewing locally, serve over HTTP (see README).</p>";
            console.error(err);
         });
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }
})(typeof window !== "undefined" ? window : globalThis);
