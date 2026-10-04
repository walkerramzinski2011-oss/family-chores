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
.chore-calendar-day{min-height:78px;padding:6px;border:1px solid #242b26;border-radius:7px;background:#090c0a;overflow:hidden}
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
@media(max-width:650px){.chore-calendar{padding:12px}.chore-calendar-day{min-height:64px;padding:4px}.chore-calendar-item{font-size:8px}.chore-calendar-nav button{padding:5px 7px!important}.chore-calendar-week div{font-size:9px}}
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
function familyChoresCalendar(){
  const visible=me?.role==="child"?chores.filter(c=>c.assigned_to===session.user.id):chores.slice();
  const y=familyChoresCalendarMonth.getFullYear(),m=familyChoresCalendarMonth.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
  const monthName=familyChoresCalendarMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"}),today=new Date();
  const days=Array.from({length:42},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));
  const cells=days.map(d=>{
    const items=visible.filter(c=>familyChoresCalendarOccurs(c,d)),other=d.getMonth()!==m,isToday=familyChoresCalendarKey(d)===familyChoresCalendarKey(today),shown=items.slice(0,3);
    return '<div class="chore-calendar-day'+(other?" is-other":"")+(isToday?" is-today":"")+'"><div class="chore-calendar-date">'+d.getDate()+'</div>'+shown.map(c=>'<div class="chore-calendar-item '+(c.status==="todo"?"is-pending":"is-done")+'" title="'+esc(c.title)+'">'+esc(c.title)+(me?.role==="parent"?" · "+esc(name(c.assigned_to)):"")+'</div>').join("")+(items.length>3?'<div class="chore-calendar-more">+'+(items.length-3)+" more</div>":"")+"</div>";
  }).join("");
  const unscheduled=visible.filter(c=>!c.due_date);
  return '<div class="chore-calendar"><div class="chore-calendar-head"><div><div class="chore-calendar-title">Chore Calendar</div><div class="chore-calendar-subtitle">Scheduled chores for the month</div></div><div class="chore-calendar-nav"><button type="button" data-calendar-nav="-1">‹</button><button type="button" data-calendar-today="1">Today</button><button type="button" data-calendar-nav="1">›</button></div></div><div class="chore-calendar-month">'+esc(monthName)+'</div><div class="chore-calendar-week"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="chore-calendar-grid">'+cells+'</div>'+(unscheduled.length?'<div class="chore-calendar-unscheduled"><div class="chore-calendar-unscheduled-title">No due date</div><div class="chore-calendar-list">'+unscheduled.map(c=>'<span class="chore-calendar-chip">'+esc(c.title)+"</span>").join("")+"</div></div>":"")+"</div>";
}
`;

const hook='app.innerHTML=top+(parent?parentUI():childUI());document.getElementById("logout").onclick=()=>db.auth.signOut()}';
const replacement='app.innerHTML=top+(parent?parentUI():childUI())+familyChoresCalendar();document.getElementById("logout").onclick=()=>db.auth.signOut();document.querySelectorAll("[data-calendar-nav]").forEach(btn=>btn.onclick=()=>{familyChoresCalendarMonth.setMonth(familyChoresCalendarMonth.getMonth()+Number(btn.dataset.calendarNav));dashboard()});const todayBtn=document.querySelector("[data-calendar-today]");if(todayBtn)todayBtn.onclick=()=>{familyChoresCalendarMonth=new Date();familyChoresCalendarMonth.setDate(1);dashboard()}}';
if(!html.includes(hook)) throw new Error("Dashboard hook not found");
html=html.replace(hook,replacement);

if(!html.includes("let familyChoresCalendarMonth")) {
  html=html.replace("async function start(){",helper+"\nasync function start(){");
}
fs.writeFileSync(file,html);
console.log("Added non-collapsible chore calendar.");
