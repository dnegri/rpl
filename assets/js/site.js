/* RPL site renderer — turns content/*.yml files into the page.
   No build step: the browser loads the content files and renders them into the
   existing design. Edit the files in content/, not this file.

   Conventions used in the content files:
   • Images: write just a file name (e.g. photo: core.jpg) and it is loaded from
     assets/img/. A full path or URL is used as-is. Images auto-fit their column.
   • Prose fields (body, intro, desc, caption, meta …) accept **Markdown**.
   • Card sections accept an optional  columns: N  to set the layout (1, 2, 3, 4).

   Visual language: the "Industry" design system — square blueprint frames with
   corner registration marks, steel-blue on industrial grey, Barlow Condensed
   uppercase headings. Photos get a duotone steel tint; data figures do not.
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

  // Blueprint corner registration marks.
  function corners() {
    return '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>';
  }

  function head(d) {
    return (d.kicker ? '<p class="kicker">' + esc(d.kicker) + "</p>" : "") +
           (d.heading ? "<h2>" + mdi(d.heading) + "</h2>" : "") +
           (d.intro ? '<p class="intro">' + mdi(d.intro) + "</p>" : "");
  }
  var RULE = '<hr class="rule">';

  // Data figures (plots, diagrams) keep their own colour — blueprint frame only.
  function figure(fig) {
    if (!fig) return "";
    if (typeof fig === "string") fig = { src: fig };
    return '<figure class="figure blueprint">' + corners() +
      '<img src="' + esc(imgSrc(fig.src)) + '" alt="' + esc(fig.alt || fig.caption || "") + '" loading="lazy">' +
      (fig.caption ? "<figcaption>" + mdi(fig.caption) + "</figcaption>" : "") + "</figure>";
  }
  function figures(list) {
    if (!list || !list.length) return "";
    var inner = list.map(figure).join("");
    return list.length > 1 ? '<div class="smr-figs">' + inner + "</div>" : inner;
  }

  // ---- section renderers ---------------------------------------------------

  function renderAbout(d) { return head(d) + (d.body ? '<div class="prose">' + md(d.body) + "</div>" : ""); }

  function renderKings(d) {
    var facts = (d.facts && d.facts.length) ? '<div class="kings-facts">' + d.facts.map(function (f) {
      return '<div class="kf"><b>' + esc(f.value) + "</b><span>" + esc(f.label) + "</span></div>";
    }).join("") + "</div>" : "";
    return head(d) +
      '<div class="kings-grid">' +
        '<div class="kings-copy">' + md(d.body) + facts + "</div>" +
        '<figure class="kings-photo blueprint duotone">' + corners() +
          '<img src="' + esc(imgSrc(d.photo)) + '" alt="' + esc(d.photo_alt || "KINGS campus") + '" loading="lazy">' +
          (d.caption ? "<figcaption>" + mdi(d.caption) + "</figcaption>" : "") +
        "</figure>" +
      "</div>";
  }

  function renderResearch(d) {
    var cards = (d.cards || []).map(function (c, i) {
      var n = c.n != null ? c.n : ("0" + (i + 1)).slice(-2);
      return '<div class="rcard blueprint">' + corners() +
        '<div class="rn">' + esc(n) + "</div>" +
        "<h3>" + mdi(c.title) + "</h3><p>" + mdi(c.body) + "</p></div>";
    }).join("");
    return head(d) + RULE + '<div class="rgrid">' + cards + "</div>" + figure(d.figure);
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
    var rows = (d.groups || []).map(function (g) {
      var groupRow = '<tr class="grp"><td colspan="4">' + esc(g.label) + "</td></tr>";
      var codeRows = (g.codes || []).map(function (c) {
        var tags = (c.tags && c.tags.length)
          ? '<div class="ctags">' + c.tags.map(function (t) { return '<span class="tag tag-neutral">' + esc(t) + "</span>"; }).join("") + "</div>"
          : "";
        var status = c.status ? '<span class="tag tag-outline">' + esc(c.status) + "</span>" : "";
        return "<tr>" +
          '<td class="cname">' + esc(c.name) + "</td>" +
          '<td class="cexp">' + mdi(c.exp || "") + "</td>" +
          "<td>" + tags + "</td>" +
          "<td>" + status + "</td></tr>";
      }).join("");
      return groupRow + codeRows;
    }).join("");
    var table = rows ? '<div class="table-wrap"><table class="table">' +
      "<thead><tr>" +
        '<th style="width:150px">Code</th><th>Full name</th>' +
        '<th style="width:230px">Focus</th><th style="width:120px">Status</th>' +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>" : "";
    return head(d) + pipe +
      (d.pipeline_note ? '<p class="pipe-note">' + mdi(d.pipeline_note) + "</p>" : "") +
      figure(d.figure) + table +
      (d.foundation ? '<p class="foundation">' + mdi(d.foundation) + "</p>" : "");
  }

  function renderSMR(d) {
    var boxes = (d.boxes || []).map(function (b) {
      return '<div class="fbox blueprint">' + corners() + "<h3>" + mdi(b.title) + "</h3>" +
        (b.subtitle ? '<p class="fsub">' + mdi(b.subtitle) + "</p>" : "") +
        '<div class="specs">' + (b.specs || []).map(function (r) {
          return '<div class="row"><span class="k">' + esc(r.k) + '</span><span class="v">' + esc(r.v) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
    return head(d) + RULE + '<div class="feat">' + boxes + "</div>" + figures(d.figures);
  }

  function personCard(p) {
    var photo = p.photo
      ? '<figure class="pphoto duotone"><img src="' + esc(imgSrc(p.photo)) + '" alt="' + esc(p.name) + '" loading="lazy"></figure>'
      : '<div class="mono">' + esc(initials(p.name)) + "</div>";
    return '<div class="pcard blueprint">' + corners() + photo + '<div class="pbody">' +
      '<div class="pn">' + esc(p.name) + "</div>" +
      (p.role ? '<div class="pr">' + esc(p.role) + "</div>" : "") +
      (p.affiliation ? '<div class="paff">' + esc(p.affiliation) + "</div>" : "") +
      (p.bio ? '<div class="pf">' + mdi(p.bio) + "</div>" : "") + "</div></div>";
  }
  function renderPeople(d) {
    var pi = d.pi ? '<div class="pi-feature blueprint">' + corners() +
      '<figure class="pi-photo blueprint duotone">' + corners() +
        (d.pi.photo ? '<img src="' + esc(imgSrc(d.pi.photo)) + '" alt="' + esc(d.pi.name) + '" loading="lazy">' : "") +
      "</figure>" +
      '<div class="pi-body">' +
        (d.pi.role ? '<span class="tag tag-outline">' + esc(d.pi.role) + "</span>" : "") +
        '<div class="pn">' + esc(d.pi.name) + "</div>" +
        (d.pi.affiliation ? '<div class="paff">' + esc(d.pi.affiliation) + "</div>" : "") +
        (d.pi.email ? '<div class="pmail"><a href="mailto:' + esc(d.pi.email) + '">' + esc(d.pi.email) + "</a></div>" : "") +
        (d.pi.bio ? '<p class="pbio">' + mdi(d.pi.bio) + "</p>" : "") +
      "</div></div>" : "";
    var groups = (d.groups || []).map(function (g) {
      return '<div class="pgroup"><p class="glab">' + esc(g.label) + "</p>" +
        '<div class="pgrid">' + (g.people || []).map(personCard).join("") + "</div></div>";
    }).join("");
    return head(d) + pi + groups;
  }

  function renderPubs(d) {
    var metrics = (d.metrics && d.metrics.length) ? '<div class="pubmetrics">' + d.metrics.map(function (m) {
      return '<div class="m blueprint">' + corners() + "<b>" + esc(m.value) + "</b><span>" + esc(m.label) + "</span></div>";
    }).join("") + "</div>" : "";
    var header = '<div class="pubhead"><div>' +
      (d.kicker ? '<p class="kicker">' + esc(d.kicker) + "</p>" : "") +
      (d.heading ? "<h2>" + mdi(d.heading) + "</h2>" : "") + "</div>" + metrics + "</div>";
    var list = '<div class="publist">' + (d.items || []).map(function (p) {
      return '<div class="pub"><div class="yr">' + esc(p.year) + "</div><div>" +
        '<p class="pt">' + mdi(p.title) + "</p>" +
        (p.meta ? '<div class="pmeta">' + mdi(p.meta) + "</div>" : "") + "</div></div>";
    }).join("") + "</div>";
    return header + RULE + list + (d.note ? '<p class="pubmore">' + mdi(d.note) + "</p>" : "");
  }

  function renderTeaching(d) {
    var cards = (d.courses || []).map(function (c) {
      return '<div class="tcard blueprint">' + corners() + "<h3>" + mdi(c.title) + "</h3><p>" + mdi(c.body) + "</p></div>";
    }).join("");
    return head(d) + RULE + '<div class="tgrid">' + cards + "</div>";
  }

  function renderContact(d) {
    var addr = '<div class="cbox blueprint">' + corners() + '<p class="clab">' + esc(d.address_label || "Address") + "</p><address>" +
      (d.address_title ? '<span class="big">' + esc(d.address_title) + "</span><br>" : "") +
      (d.address || []).map(esc).join("<br>") + "</address></div>";
    var det = '<div class="cbox blueprint">' + corners() + '<p class="clab">' + esc(d.details_label || "Get in touch") + "</p>" +
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
            el.innerHTML = '<p style="color:var(--accent-700)">Content failed to load (' + esc(err.message) +
              "). If previewing locally, serve over HTTP (see README).</p>";
            console.error(err);
         });
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }
})(typeof window !== "undefined" ? window : globalThis);
