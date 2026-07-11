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

  var renderers = {
    "about-root": { file: "content/about.yml", render: renderAbout },
    "kings-root": { file: "content/kings.yml", render: renderKings },
    "research-root": { file: "content/research.yml", render: renderResearch },
    "codes-root": { file: "content/codes.yml", render: renderCodes },
    "smr-root": { file: "content/smr.yml", render: renderSMR },
    "people-root": { file: "content/people.yml", render: renderPeople },
    "publications-root": { file: "content/publications.yml", render: renderPubs },
    "teaching-root": { file: "content/teaching.yml", render: renderTeaching },
    "contact-root": { file: "content/contact.yml", render: renderContact }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      renderAbout: renderAbout, renderKings: renderKings, renderResearch: renderResearch,
      renderCodes: renderCodes, renderSMR: renderSMR, renderPeople: renderPeople,
      renderPubs: renderPubs, renderTeaching: renderTeaching, renderContact: renderContact,
      imgSrc: imgSrc, initials: initials, esc: esc, _setLibs: function (y, m) { yaml = y; marked = m; }
    };
  }

  if (typeof document !== "undefined") {
    var run = function () {
      Object.keys(renderers).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var r = renderers[id];
        fetch(r.file)
          .then(function (res) { if (!res.ok) throw new Error(res.status + " " + r.file); return res.text(); })
          .then(function (txt) { el.innerHTML = r.render(yaml.load(txt) || {}); })
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
