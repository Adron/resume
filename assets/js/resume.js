// Lays out the markdown-rendered resume like a printed resume: each role's
// "Company / Dates | Location" lines become a right-aligned date and a meta line.
(function () {
  var resume = document.querySelector('.resume');
  if (!resume) return;

  var DATE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{4}\s*[-–]\s*(\d{4}|Present)\b|^\d{4}$/;

  // Bare URLs in the markdown are not auto-linked by kramdown.
  var walker = document.createTreeWalker(resume, NodeFilter.SHOW_TEXT);
  var textNodes = [];
  while (walker.nextNode()) {
    if (!walker.currentNode.parentElement.closest('a') && /https?:\/\//.test(walker.currentNode.nodeValue)) {
      textNodes.push(walker.currentNode);
    }
  }
  textNodes.forEach(function (node) {
    var frag = document.createDocumentFragment();
    node.nodeValue.split(/(https?:\/\/[^\s)]+)/).forEach(function (part, i) {
      if (i % 2) {
        var a = document.createElement('a');
        a.href = part;
        a.textContent = part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        frag.appendChild(a);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(frag, node);
  });

  // A bold line right under the name is the headline.
  var afterName = resume.querySelector('h1 + p');
  if (afterName && afterName.children.length === 1 && afterName.firstElementChild.tagName === 'STRONG' &&
      afterName.textContent.trim() === afterName.firstElementChild.textContent.trim()) {
    afterName.className = 'headline';
    afterName.textContent = afterName.textContent.trim();
  }

  // The page toolbar already offers the Word download.
  resume.querySelectorAll('h1 + ul a[href$=".docx"], .headline + ul a[href$=".docx"]').forEach(function (a) {
    a.closest('li').remove();
  });

  resume.querySelectorAll('h3').forEach(function (h3) {
    var p = h3.nextElementSibling;
    if (!p || p.tagName !== 'P' || p.querySelector('a, strong')) return;
    var lines = p.textContent.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length > 4 || lines.some(function (l) { return l.length > 140; })) return;

    var dates = '';
    var meta = [];
    lines.forEach(function (line) {
      var parts = line.split('|').map(function (s) { return s.trim(); });
      if (!dates && DATE.test(parts[0])) {
        dates = parts[0];
        meta = meta.concat(parts.slice(1));
      } else {
        meta = meta.concat(parts);
      }
    });

    var header = document.createElement('div');
    header.className = 'role-header';
    var title = document.createElement('span');
    title.textContent = h3.textContent;
    header.appendChild(title);
    if (dates) {
      var d = document.createElement('span');
      d.className = 'role-dates';
      d.textContent = dates;
      header.appendChild(d);
    }
    h3.textContent = '';
    h3.appendChild(header);

    if (meta.length) {
      p.className = 'role-meta';
      p.textContent = meta.join(' — ');
    } else {
      p.remove();
    }
  });

  // Paragraphs that are a single italic line are client lists, tooling lists, or sub-role headings.
  resume.querySelectorAll('p').forEach(function (p) {
    var only = p.children.length === 1 && p.firstElementChild;
    if (!only || !/^(EM|STRONG)$/.test(only.tagName)) return;
    if (p.textContent.trim() !== only.textContent.trim()) return;
    var text = p.textContent.trim();
    p.classList.add(/^Tooling/i.test(text) ? 'tooling' : /^(Clients|Other CTC clients)/i.test(text) ? 'clients' : 'subrole');
  });
})();
