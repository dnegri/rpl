/* RPL site renderer — turns content/*.yml files into the page.
   No build step: the browser loads the content files and renders them
   into the existing design. Edit content/*.yml, not this file.        */
(function (root) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function initials(name) {
    var parts = String(name || "")
      .replace(/^(Prof\.?|Dr\.?)\s+/i, "")
      .split("·")[0]
      .trim()
      .split(/\s+/);
    var a = (parts[0] || "")[0] || "";
    var b = (parts[1] || "")[0] || "";
    return (a + b).toUpperCase();
  }

  function avatar(p) {
    return p.photo
      ? '<img class="avatar" src="assets/img/' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<div class="mono">' + esc(initials(p.name)) + "</div>";
  }

  function personCard(p) {
    return '<div class="pcard">' + avatar(p) + '<div class="pbody">' +
      '<div class="pn">' + esc(p.name) + "</div>" +
      (p.role ? '<div class="pr">' + esc(p.role) + "</div>" : "") +
      (p.affiliation ? '<div class="paff">' + esc(p.affiliation) + "</div>" : "") +
      (p.bio ? '<div class="pf">' + esc(p.bio) + "</div>" : "") +
      "</div></div>";
  }

  function piFeature(pi) {
    if (!pi) return "";
    return '<div class="pi-feature">' +
      (pi.photo ? '<img class="pi-photo" src="assets/img/' + esc(pi.photo) + '" alt="' + esc(pi.name) + '" loading="lazy">' : "") +
      "<div>" +
        '<div class="pn">' + esc(pi.name) + "</div>" +
        (pi.role ? '<div class="pr">' + esc(pi.role) + "</div>" : "") +
        (pi.affiliation ? '<div class="paff">' + esc(pi.affiliation) + "</div>" : "") +
        (pi.bio ? '<p class="pbio">' + esc(pi.bio) + "</p>" : "") +
        (pi.email ? '<div class="pmail"><a href="mailto:' + esc(pi.email) + '">' + esc(pi.email) + "</a></div>" : "") +
      "</div></div>";
  }

  function group(g) {
    return '<div class="pgroup"><p class="glab">' + esc(g.label) + '</p><div class="pgrid">' +
      (g.people || []).map(personCard).join("") + "</div></div>";
  }

  function renderPeople(d) {
    d = d || {};
    return '<p class="kicker">' + esc(d.kicker || "People") + "</p>" +
      "<h2>" + esc(d.heading || "") + "</h2>" +
      piFeature(d.pi) +
      (d.groups || []).map(group).join("");
  }

  var renderers = { "people-root": { file: "content/people.yml", render: renderPeople } };

  // Node export for tests
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { renderPeople: renderPeople, initials: initials, esc: esc };
  }

  // Browser bootstrap
  if (typeof document !== "undefined") {
    var run = function () {
      Object.keys(renderers).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var r = renderers[id];
        fetch(r.file)
          .then(function (res) { if (!res.ok) throw new Error(res.status + " " + r.file); return res.text(); })
          .then(function (txt) { el.innerHTML = r.render(root.jsyaml.load(txt)); })
          .catch(function (err) {
            el.innerHTML = '<p class="kicker">People</p><p style="color:var(--copper)">Content failed to load (' +
              esc(err.message) + "). If you are previewing locally, run a web server (see README).</p>";
            console.error(err);
          });
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }
})(typeof window !== "undefined" ? window : globalThis);
