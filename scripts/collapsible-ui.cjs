const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const css = `
.collapsible-card{overflow:hidden}
.collapsible-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:0}
.collapsible-head h2{margin:0!important}
.collapse-toggle{flex:0 0 auto;padding:5px 9px!important;margin:0!important;border:1px solid #29312b!important;border-radius:7px!important;background:#090c0a!important;color:#a7d98a!important;font-size:11px!important;font-weight:700!important;cursor:pointer}
.collapse-toggle:hover{transform:none!important;background:#121612!important}
.collapsible-body{padding-top:10px}
.collapsible-card.is-collapsed .collapsible-body{display:none}
.collapsible-card.is-collapsed .collapsible-head{margin-bottom:0}
.collapsible-card.is-collapsed{padding-bottom:12px}
`;

if (!html.includes(".collapsible-card{")) {
  html = html.replace("</style>", css + "</style>");
}

const js = `
function enhanceCollapsibleSections(){
  const cards=[...document.querySelectorAll("#app .card")];
  const storageKey="familyChores.collapsedSections";

  let saved={};
  try{ saved=JSON.parse(localStorage.getItem(storageKey)||"{}")||{}; }catch(e){ saved={}; }

  cards.forEach((card,index)=>{
    if(card.dataset.collapsibleReady==="1") return;
    const heading=card.querySelector(":scope > h2");
    if(!heading) return;

    card.dataset.collapsibleReady="1";
    card.classList.add("collapsible-card");

    const sectionKey=(heading.textContent||"").trim()+"::"+index;

    const body=document.createElement("div");
    body.className="collapsible-body";

    const nodes=[...card.children].filter(el=>el!==heading);
    nodes.forEach(el=>body.appendChild(el));

    const head=document.createElement("div");
    head.className="collapsible-head";
    head.appendChild(heading);

    const toggle=document.createElement("button");
    toggle.type="button";
    toggle.className="collapse-toggle";
    toggle.setAttribute("aria-expanded","true");
    toggle.textContent="Collapse";

    const setState=collapsed=>{
      card.classList.toggle("is-collapsed",collapsed);
      toggle.textContent=collapsed?"Expand":"Collapse";
      toggle.setAttribute("aria-expanded",String(!collapsed));
      saved[sectionKey]=collapsed;
      try{ localStorage.setItem(storageKey,JSON.stringify(saved)); }catch(e){}
    };

    toggle.onclick=()=>{
      setState(!card.classList.contains("is-collapsed"));
    };

    head.appendChild(toggle);
    card.appendChild(head);
    card.appendChild(body);

    if(saved[sectionKey]===true){
      setState(true);
    }
  });
}
`;

if (!html.includes("function enhanceCollapsibleSections()")) {
  const marker = "async function start(){";
  if (!html.includes(marker)) throw new Error("Could not find start() in index.html");
  html = html.replace(marker, js + "\n" + marker);
}

const renderMarker = 'app.innerHTML=top+(parent?parentUI():childUI());';
if (!html.includes(renderMarker)) throw new Error("Could not find dashboard render marker");

const oldCall = 'app.innerHTML=top+(parent?parentUI():childUI());enhanceCollapsibleSections();';
if (!html.includes(oldCall)) {
  html = html.replace(renderMarker, renderMarker + 'enhanceCollapsibleSections();');
}

fs.writeFileSync(file, html);
console.log("Updated collapsible sections to remember open/closed state across dashboard refreshes.");
