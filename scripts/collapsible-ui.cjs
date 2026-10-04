const fs=require("fs");
const file="index.html";
let html=fs.readFileSync(file,"utf8");

const old=`const setState=collapsed=>{\n      card.classList.toggle("is-collapsed",collapsed);\n      toggle.textContent=collapsed?"Expand":"Collapse";\n      toggle.setAttribute("aria-expanded",String(!collapsed));\n      saved[sectionKey]=collapsed;\n      try{ localStorage.setItem(storageKey,JSON.stringify(saved)); }catch(e){}\n    };\n\n    toggle.onclick=()=>{\n      setState(!card.classList.contains("is-collapsed"));\n    };`;
const replacement=`const setState=collapsed=>{\n      card.classList.toggle("is-collapsed",collapsed);\n      body.hidden=collapsed;\n      toggle.textContent=collapsed?"Expand":"Collapse";\n      toggle.setAttribute("aria-expanded",String(!collapsed));\n      saved[sectionKey]=collapsed;\n      try{ localStorage.setItem(storageKey,JSON.stringify(saved)); }catch(e){}\n    };\n\n    toggle.addEventListener("click",event=>{\n      event.preventDefault();\n      event.stopPropagation();\n      setState(!body.hidden);\n    });`;
if(!html.includes(old)) throw new Error("Could not find collapsible toggle implementation");
html=html.replace(old,replacement);

const cssMarker=".collapsible-body{padding-top:10px}";
if(html.includes(cssMarker) && !html.includes(".collapsible-body[hidden]")) {
  html=html.replace(cssMarker,cssMarker+"\n.collapsible-body[hidden]{display:none!important}");
}

fs.writeFileSync(file,html);
console.log("Made collapsible sections use deterministic hidden-state toggling.");
