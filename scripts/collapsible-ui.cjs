const fs=require("fs");
const file="index.html";
let html=fs.readFileSync(file,"utf8");

const marker="<!-- FAMILY CHORES COLLAPSIBLE SECTIONS -->";
if(html.includes(marker)){
  console.log("Collapsible sections already injected.");
  process.exit(0);
}

const css=\`
<style id="family-chores-collapsible-css">
.collapsible-card{overflow:hidden}
.collapsible-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:0}
.collapsible-head h2{margin:0!important}
.collapse-toggle{flex:0 0 auto;padding:5px 9px!important;margin:0!important;border:1px solid #29312b!important;border-radius:7px!important;background:#090c0a!important;color:#a7d98a!important;font-size:11px!important;font-weight:700!important;cursor:pointer}
.collapse-toggle:hover{transform:none!important;background:#121612!important}
.collapsible-body{padding-top:10px}
.collapsible-body[hidden]{display:none!important}
.collapsible-card.is-collapsed{padding-bottom:12px}
</style>
\`;

const js=\`
<script id="family-chores-collapsible-script">
(function(){
  const storageKey="familyChores.collapsedSections";

  function readSaved(){
    try{return JSON.parse(localStorage.getItem(storageKey)||"{}")||{};}
    catch(e){return {};}
  }

  function writeSaved(saved){
    try{localStorage.setItem(storageKey,JSON.stringify(saved));}
    catch(e){}
  }

  function sectionKey(card,heading){
    const explicit=card.getAttribute("data-collapse-key");
    if(explicit) return explicit;
    return (heading.textContent||"").trim();
  }

  function enhance(){
    const app=document.getElementById("app");
    if(!app) return;

    const saved=readSaved();
    const cards=[...app.querySelectorAll(":scope > .card")];

    cards.forEach((card)=>{
      if(card.dataset.collapsibleReady==="1") return;

      const heading=card.querySelector(":scope > h2");
      if(!heading) return;

      card.dataset.collapsibleReady="1";
      card.classList.add("collapsible-card");

      const key=sectionKey(card,heading);

      const body=document.createElement("div");
      body.className="collapsible-body";

      [...card.children].forEach((child)=>{
        if(child!==heading) body.appendChild(child);
      });

      const head=document.createElement("div");
      head.className="collapsible-head";
      head.appendChild(heading);

      const toggle=document.createElement("button");
      toggle.type="button";
      toggle.className="collapse-toggle";

      function setState(collapsed,save){
        card.classList.toggle("is-collapsed",collapsed);
        body.hidden=collapsed;
        toggle.textContent=collapsed?"Expand":"Collapse";
        toggle.setAttribute("aria-expanded",collapsed?"false":"true");
        if(save){
          saved[key]=collapsed;
          writeSaved(saved);
        }
      }

      toggle.addEventListener("click",(event)=>{
        event.preventDefault();
        event.stopPropagation();
        setState(!body.hidden,true);
      });

      head.appendChild(toggle);
      card.appendChild(head);
      card.appendChild(body);

      setState(saved[key]===true,false);
    });
  }

  let scheduled=false;
  function scheduleEnhance(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      enhance();
    });
  }

  const observer=new MutationObserver(scheduleEnhance);

  function start(){
    const app=document.getElementById("app");
    if(!app){
      setTimeout(start,100);
      return;
    }
    observer.observe(app,{childList:true,subtree:true});
    enhance();
  }

  start();
})();
</script>
\`;

html=html.replace("</head>",css+"</head>");
html=html.replace("</body>",marker+js+"</body>");
fs.writeFileSync(file,html);
console.log("Added robust collapsible dashboard sections.");
