const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const markerStart = "<!-- FAMILY CHORES COLLAPSIBLE SECTIONS -->";
const markerEnd = "<!-- /FAMILY CHORES COLLAPSIBLE SECTIONS -->";

const css = [
  "<style id=\"family-chores-collapsible-css\">",
  ".collapsible-card{overflow:hidden}",
  ".collapsible-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:0}",
  ".collapsible-head h2{margin:0!important}",
  ".collapse-toggle{flex:0 0 auto;padding:5px 9px!important;margin:0!important;border:1px solid #29312b!important;border-radius:7px!important;background:#090c0a!important;color:#a7d98a!important;font-size:11px!important;font-weight:700!important;cursor:pointer}",
  ".collapse-toggle:hover{transform:none!important;background:#121612!important}",
  ".collapsible-body{padding-top:10px}",
  ".collapsible-body[hidden]{display:none!important}",
  ".collapsible-card.is-collapsed{padding-bottom:12px}",
  "</style>"
].join("\n");

const js = [
  "<script id=\"family-chores-collapsible-script\">",
  "(function(){",
  "  const storageKey = \"familyChores.collapsedSections\";",
  "  function readSaved(){",
  "    try { return JSON.parse(localStorage.getItem(storageKey) || \"{}\") || {}; } catch(e) { return {}; }",
  "  }",
  "  function writeSaved(saved){",
  "    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch(e) {}",
  "  }",
  "  function enhance(){",
  "    const app = document.getElementById(\"app\");",
  "    if(!app) return;",
  "    const saved = readSaved();",
  "    const cards = Array.from(app.querySelectorAll(\".card\"));",
  "    cards.forEach(function(card, index){",
  "      if(card.dataset.collapsibleReady === \"1\") return;",
  "      const heading = Array.from(card.children).find(function(el){ return el.tagName === \"H2\"; });",
  "      if(!heading) return;",
  "      card.dataset.collapsibleReady = \"1\";",
  "      card.classList.add(\"collapsible-card\");",
  "      const key = (card.getAttribute(\"data-collapse-key\") || heading.textContent || \"section\").trim() + \"::\" + index;",
  "      const body = document.createElement(\"div\");",
  "      body.className = \"collapsible-body\";",
  "      Array.from(card.children).forEach(function(child){ if(child !== heading) body.appendChild(child); });",
  "      const head = document.createElement(\"div\");",
  "      head.className = \"collapsible-head\";",
  "      head.appendChild(heading);",
  "      const toggle = document.createElement(\"button\");",
  "      toggle.type = \"button\";",
  "      toggle.className = \"collapse-toggle\";",
  "      function setState(collapsed, save){",
  "        card.classList.toggle(\"is-collapsed\", collapsed);",
  "        body.hidden = collapsed;",
  "        toggle.textContent = collapsed ? \"Expand\" : \"Collapse\";",
  "        toggle.setAttribute(\"aria-expanded\", collapsed ? \"false\" : \"true\");",
  "        if(save){ saved[key] = collapsed; writeSaved(saved); }",
  "      }",
  "      toggle.addEventListener(\"click\", function(event){",
  "        event.preventDefault();",
  "        event.stopPropagation();",
  "        setState(!body.hidden, true);",
  "      });",
  "      head.appendChild(toggle);",
  "      card.appendChild(head);",
  "      card.appendChild(body);",
  "      setState(saved[key] === true, false);",
  "    });",
  "  }",
  "  let scheduled = false;",
  "  function schedule(){",
  "    if(scheduled) return;",
  "    scheduled = true;",
  "    requestAnimationFrame(function(){ scheduled = false; enhance(); });",
  "  }",
  "  function start(){",
  "    const app = document.getElementById(\"app\");",
  "    if(!app){ setTimeout(start, 100); return; }",
  "    new MutationObserver(schedule).observe(app, {childList:true, subtree:true});",
  "    enhance();",
  "  }",
  "  start();",
  "})();",
  "</script>"
].join("\n");

const block = markerStart + "\n" + css + "\n" + js + "\n" + markerEnd;

const start = html.indexOf(markerStart);
const end = html.indexOf(markerEnd);
if(start !== -1 && end !== -1 && end > start){
  html = html.slice(0, start) + block + html.slice(end + markerEnd.length);
} else {
  html = html.replace("</head>", css + "\n</head>");
  html = html.replace("</body>", markerStart + "\n" + js + "\n" + markerEnd + "\n</body>");
}

fs.writeFileSync(file, html);
console.log("Added working collapsible dashboard sections.");
