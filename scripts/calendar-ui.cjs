const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");
const startMarker = "<!-- FAMILY CHORES CALENDAR -->";
const endMarker = "<!-- /FAMILY CHORES CALENDAR -->";

const css = `<style id="family-chores-calendar-css">
.chore-calendar{margin-top:12px;padding:14px 16px;border:1px solid #29312b;border-radius:11px;background:#0d110e;box-shadow:0 5px 18px rgba(0,0,0,.2)}
.chore-calendar-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.chore-calendar-title{font-size:16px;font-weight:800;margin:0}
.chore-calendar-subtitle{font-size:11px;color:var(--muted);margin-top:2px}
.chore-calendar-nav{display:flex;gap:5px}
.chore-calendar-nav button{padding:6px 9px!important;margin:0!important;font-size:11px!important}
.chore-calendar-month{text-align:center;font-size:13px;font-weight:800;margin:5px 0 8px}
.chore-calendar-week,.chore-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.chore-calendar-week{margin-bottom:4px}
.chore-calendar-week div{text-align:center;color:var(--muted);font-size:10px;font-weight:800;padding:4px 0}
.chore-calendar-day{min-height:78px;padding:6px;border:1px solid #242b26;border-radius:7px;background:#090c0a;overflow:hidden;cursor:pointer}
.chore-calendar-day:hover{border-color:#52604f}
.chore-calendar-day.is-other{opacity:.38}
.chore-calendar-day.is-today{border-color:#79a866;box-shadow:inset 0 0 0 1px #79a866}
.chore-calendar-date{font-size:11px;font-weight:800;margin-bottom:4px}
.chore-calendar-item{display:block;margin:2px 0;padding:3px 4px;border-radius:4px;background:#172019;font-size:9px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chore-calendar-item.is-pending{border-left:2px solid #d8a44b}
.chore-calendar-item.is-done{border-left:2px solid #79a866;opacity:.72}
.chore-calendar-more{font-size:9px;color:var(--muted);padding:2px 4px}
.chore-calendar-unscheduled{margin-top:10px;padding-top:9px;border-top:1px solid #242b26}
.chore-calendar-unscheduled-title{font-size:11px;font-weight:800;margin-bottom:5px}
.chore-calendar-list{display:flex;flex-wrap:wrap;gap:5px}
.chore-calendar-chip{padding:4px 7px;border:1px solid #29312b;border-radius:6px;background:#090c0a;font-size:10px}
.chore-calendar-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.68)}
.chore-calendar-modal[hidden]{display:none!important}
.chore-calendar-dialog{width:min(560px,100%);max-height:85vh;overflow:auto;padding:18px;border:1px solid #29312b;border-radius:12px;background:#0d110e;box-shadow:0 12px 40px rgba(0,0,0,.45)}
.chore-calendar-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.chore-calendar-dialog-title{font-size:18px;font-weight:800}
.chore-calendar-dialog-close{padding:6px 10px!important;margin:0!important}
.chore-calendar-detail{padding:11px 0;border-top:1px solid #242b26}
.chore-calendar-detail-title{font-size:13px;font-weight:800;margin-bottom:6px}
.chore-calendar-detail-row{font-size:11px;line-height:1.45;margin:3px 0}
.chore-calendar-detail-label{color:var(--muted)}
.chore-calendar-empty-detail{padding:12px 0;color:var(--muted);font-size:12px}
@media(max-width:650px){.chore-calendar{padding:12px}.chore-calendar-day{min-height:64px;padding:4px}.chore-calendar-item{font-size:8px}.chore-calendar-nav button{padding:5px 7px!important}.chore-calendar-week div{font-size:9px}.chore-calendar-modal{padding:10px}.chore-calendar-dialog{padding:14px;max-height:90vh}}
</style>`;

if (html.includes(startMarker) && html.includes(endMarker)) {
  const a=html.indexOf(startMarker), b=html.indexOf(endMarker);
  html=html.slice(0,a)+startMarker+"\n"+css+"\n"+endMarker+html.slice(b+endMarker.length);
} else {
  html=html.replace("</head>",css+"\n</head>");
}

const helper = `
let familyChoresCalendarMonth=new Date();
familyChoresCalendarMonth.setDate(1);
const familyChoresCalendarDate=v=>{if(!v)return null;const p=String(v).slice(0,10).split("-").map(Number);return p.length===3&&p.every(Number.isFinite)?new Date(p[0],p[1]-1,p[2]):null};
const familyChoresCalendarKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const familyChoresCalendarOccurs=(c,d)=>{const base=familyChoresCalendarDate(c.due_date);if(!base||d<base)return false;const r=c.recurrence||"once";if(r==="daily")return true;const diff=Math.floor((d-base)/86400000);if(r==="weekly")return diff%7===0;if(r==="monthly")return d.getDate()===base.getDate();return familyChoresCalendarKey(d)===familyChoresCalendarKey(base)};
let familyChoresCalendarSelected=null;
function familyChoresCalendarDetails(dateKey){
  const d=familyChoresCalendarDate(dateKey), visible=me?.role==="child"?chores.filter(c=>c.assigned_to===session.user.id):chores.slice();
  const items=visible.filter(c=>familyChoresCalendarOccurs(c,d));
  const label=d?d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"Selected day";
  let modal=document.getElementById("family-chores-calendar-modal");
  if(!modal){modal=document.createElement("div");modal.id="family-chores-calendar-modal";modal.className="chore-calendar-modal";modal.hidden=true;modal.innerHTML='<div class="chore-calendar-dialog" role="dialog" aria-modal="true" aria-labelledby="family-chores-calendar-dialog-title"><div class="chore-calendar-dialog-head"><div id="family-chores-calendar-dialog-title" class="chore-calendar-dialog-title"></div><button type="button" class="chore-calendar-dialog-close">Close</button></div><div class="chore-calendar-dialog-body"></div></div>';document.body.appendChild(modal);modal.querySelector(".chore-calendar-dialog-close").onclick=()=>modal.hidden=true;modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true})}
  modal.querySelector(".chore-calendar-dialog-title").textContent=label;
  const body=modal.querySelector(".chore-calendar-dialog-body");
  if(!items.length){body.innerHTML='<div class="chore-calendar-empty-detail">No chores are scheduled for this day.</div>'}
  else {
    body.innerHTML=items.map(c=>{
      const status=c.status==="todo"?"Not completed":"Completed";
      const recurrence=c.recurrence||"once";
      const assigned=me?.role==="parent"?(name(c.assigned_to)||"Unassigned"):"Your chore";
      const points=c.points??c.credits??c.reward??"—";
      const desc=c.description||c.details||"No description provided.";
      return '<div class="chore-calendar-detail"><div class="chore-calendar-detail-title">'+esc(c.title||"Untitled chore")+'</div><div class="chore-calendar-detail-row"><span class="chore-calendar-detail-label">Status:</span> '+esc(status)+'</div><div class="chore-calendar-detail-row"><span class="chore-calendar-detail-label">Assigned to:</span> '+esc(assigned)+'</div><div class="chore-calendar-detail-row"><span class="chore-calendar-detail-label">Schedule:</span> '+esc(recurrence.charAt(0).toUpperCase()+recurrence.slice(1))+'</div><div class="chore-calendar-detail-row"><span class="chore-calendar-detail-label">Credits:</span> '+esc(String(points))+'</div><div class="chore-calendar-detail-row"><span class="chore-calendar-detail-label">Description:</span> '+esc(String(desc))+'</div></div>';
    }).join("");
  }
  modal.hidden=false;
  const close=modal.querySelector(".chore-calendar-dialog-close");close.focus();
}
function familyChoresCalendar(){
  const visible=me?.role==="child"?chores.filter(c=>c.assigned_to===session.user.id):chores.slice();
  const y=familyChoresCalendarMonth.getFullYear(),m=familyChoresCalendarMonth.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
  const monthName=familyChoresCalendarMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"}),today=new Date();
  const days=Array.from({length:42},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));
  const cells=days.map(d=>{
    const key=familyChoresCalendarKey(d),items=visible.filter(c=>familyChoresCalendarOccurs(c,d)),other=d.getMonth()!==m,isToday=key===familyChoresCalendarKey(today),shown=items.slice(0,3);
    return '<button type="button" class="chore-calendar-day'+(other?" is-other":"")+(isToday?" is-today":"")+'" data-calendar-day="'+key+'"><div class="chore-calendar-date">'+d.getDate()+'</div>'+shown.map(c=>'<div class="chore-calendar-item '+(c.status==="todo"?"is-pending":"is-done")+'" title="'+esc(c.title)+'">'+esc(c.title)+(me?.role==="parent"?" · "+esc(name(c.assigned_to)):"")+'</div>').join("")+(items.length>3?'<div class="chore-calendar-more">+'+(items.length-3)+" more</div>":"")+"</button>";
  }).join("");
  const unscheduled=visible.filter(c=>!c.due_date);
  return '<div class="chore-calendar"><div class="chore-calendar-head"><div><div class="chore-calendar-title">Chore Calendar</div><div class="chore-calendar-subtitle">Tap any day to see all chore details</div></div><div class="chore-calendar-nav"><button type="button" data-calendar-nav="-1">‹</button><button type="button" data-calendar-today="1">Today</button><button type="button" data-calendar-nav="1">›</button></div></div><div class="chore-calendar-month">'+esc(monthName)+'</div><div class="chore-calendar-week"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="chore-calendar-grid">'+cells+'</div>'+(unscheduled.length?'<div class="chore-calendar-unscheduled"><div class="chore-calendar-unscheduled-title">No due date</div><div class="chore-calendar-list">'+unscheduled.map(c=>'<span class="chore-calendar-chip">'+esc(c.title)+'</span>').join("")+'</div></div>':"")+'</div>';
}
`;

const hook='app.innerHTML=top+(parent?parentUI():childUI());document.getElementById("logout").onclick=()=>db.auth.signOut()}';
const replacement='app.innerHTML=top+(parent?parentUI():childUI())+familyChoresCalendar();document.getElementById("logout").onclick=()=>db.auth.signOut();document.querySelectorAll("[data-calendar-nav]").forEach(btn=>btn.onclick=()=>{familyChoresCalendarMonth.setMonth(familyChoresCalendarMonth.getMonth()+Number(btn.dataset.calendarNav));dashboard()});const todayBtn=document.querySelector("[data-calendar-today]");if(todayBtn)todayBtn.onclick=()=>{familyChoresCalendarMonth=new Date();familyChoresCalendarMonth.setDate(1);dashboard()};document.querySelectorAll("[data-calendar-day]").forEach(btn=>btn.onclick=()=>familyChoresCalendarDetails(btn.dataset.calendarDay))}';
if(!html.includes(hook)) throw new Error("Dashboard hook not found");
html=html.replace(hook,replacement);

if(!html.includes("let familyChoresCalendarMonth")) html=html.replace("async function start(){",helper+"\nasync function start(){");
fs.writeFileSync(file,html);
console.log("Added tap-to-open daily chore details.");
