const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const css = `
.family-calendar-card{min-width:0}
.family-calendar-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.family-calendar-toolbar button{padding:6px 9px!important;margin:0!important}
.family-calendar-month{font-size:13px;font-weight:800;text-align:center;flex:1}
.family-calendar-weekdays,.family-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
.family-calendar-weekday{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#707a73;text-align:center;padding:3px 0}
.family-calendar-day{min-height:74px;border:1px solid #252c27;border-radius:8px;background:#090c0a;padding:6px;overflow:hidden}
.family-calendar-day.is-today{border-color:#a7d98a;box-shadow:inset 0 0 0 1px #2f4b38}
.family-calendar-day.is-empty{background:transparent;border-color:transparent}
.family-calendar-day-number{font-size:11px;font-weight:800;color:#bfc8c2;margin-bottom:4px}
.family-calendar-day.is-today .family-calendar-day-number{color:#a7d98a}
.family-calendar-chore{font-size:10px;line-height:1.2;background:#121a14;border:1px solid #29382d;border-radius:5px;padding:3px 4px;margin-top:3px;white-space:normal;word-break:break-word}
.family-calendar-chore.done{opacity:.55;text-decoration:line-through}
.family-calendar-empty{font-size:10px;color:#69736c;text-align:center;padding-top:4px}
@media(max-width:650px){
  .family-calendar-weekdays,.family-calendar-grid{gap:3px}
  .family-calendar-day{min-height:62px;padding:4px}
  .family-calendar-chore{font-size:9px;padding:2px 3px}
  .family-calendar-day-number{font-size:10px}
}
`;

if (!html.includes(".family-calendar-card")) {
  html = html.replace("</style>", css + "</style>");
}

const js = `
function familyCalendarDateKey(y,m,d){
  return String(y).padStart(4,"0")+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
}
function familyCalendarParseDate(value){
  if(!value) return null;
  const p=String(value).slice(0,10).split("-").map(Number);
  if(p.length!==3 || p.some(Number.isNaN)) return null;
  return new Date(p[0],p[1]-1,p[2]);
}
function familyCalendarSameDay(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function familyCalendarScheduled(chore,date){
  const start=familyCalendarParseDate(chore.due_date);
  if(!start) return false;
  const target=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  if(target<new Date(start.getFullYear(),start.getMonth(),start.getDate())) return false;
  const repeat=String(chore.recurrence||"once").toLowerCase();
  if(repeat==="daily") return true;
  if(repeat==="weekly") return target.getDay()===start.getDay();
  if(repeat==="monthly") return target.getDate()===start.getDate();
  return familyCalendarSameDay(start,target);
}
function familyCalendarMonthLabel(date){
  return date.toLocaleDateString(undefined,{month:"long",year:"numeric"});
}
function renderFamilyChoreCalendar(){
  const root=document.getElementById("familyChoreCalendar");
  if(!root) return;
  const now=new Date();
  const current=window.familyChoreCalendarMonth instanceof Date
    ? new Date(window.familyChoreCalendarMonth.getFullYear(),window.familyChoreCalendarMonth.getMonth(),1)
    : new Date(now.getFullYear(),now.getMonth(),1);
  window.familyChoreCalendarMonth=current;

  const y=current.getFullYear(), m=current.getMonth();
  const first=new Date(y,m,1);
  const days=new Date(y,m+1,0).getDate();
  const leading=first.getDay();
  const todayKey=familyCalendarDateKey(now.getFullYear(),now.getMonth(),now.getDate());
  let cells="";

  for(let i=0;i<leading;i++) cells+='<div class="family-calendar-day is-empty"></div>';

  for(let d=1;d<=days;d++){
    const date=new Date(y,m,d);
    const key=familyCalendarDateKey(y,m,d);
    const scheduled=chores
      .filter(c=>c.assigned_to===session.user.id && familyCalendarScheduled(c,date))
      .sort((a,b)=>String(a.title||"").localeCompare(String(b.title||"")));
    let items=scheduled.slice(0,5).map(c=>{
      const done=String(c.status||"").toLowerCase()==="completed";
      return '<div class="family-calendar-chore'+(done?' done':'')+'" title="'+esc(c.title)+'">'+esc(c.title)+'</div>';
    }).join("");
    if(scheduled.length>5) items+='<div class="family-calendar-empty">+'+(scheduled.length-5)+" more</div>";
    cells+='<div class="family-calendar-day'+(key===todayKey?' is-today':'')+'"><div class="family-calendar-day-number">'+d+'</div>'+(items||'<div class="family-calendar-empty">—</div>')+'</div>';
  }

  root.innerHTML=
    '<div class="family-calendar-toolbar">'+
      '<button type="button" onclick="familyCalendarMove(-1)">‹</button>'+
      '<div class="family-calendar-month">'+esc(familyCalendarMonthLabel(current))+'</div>'+
      '<button type="button" onclick="familyCalendarMove(1)">›</button>'+
    '</div>'+
    '<div class="family-calendar-weekdays"><div class="family-calendar-weekday">Sun</div><div class="family-calendar-weekday">Mon</div><div class="family-calendar-weekday">Tue</div><div class="family-calendar-weekday">Wed</div><div class="family-calendar-weekday">Thu</div><div class="family-calendar-weekday">Fri</div><div class="family-calendar-weekday">Sat</div></div>'+
    '<div class="family-calendar-grid">'+cells+'</div>';
}
window.familyCalendarMove=function(delta){
  const current=window.familyChoreCalendarMonth instanceof Date
    ? window.familyChoreCalendarMonth
    : new Date();
  window.familyChoreCalendarMonth=new Date(current.getFullYear(),current.getMonth()+delta,1);
  renderFamilyChoreCalendar();
};
`;

if (!html.includes("function renderFamilyChoreCalendar()")) {
  const marker = "function childUI(){";
  if (!html.includes(marker)) throw new Error("Could not find childUI() in index.html");
  html = html.replace(marker, js + "\n" + marker);
}

const oldChild = 'function childUI(){let mine=chores.filter(c=>c.assigned_to===session.user.id);return \'<div class="card"><h2>My chores</h2>\'';
const newChild = 'function childUI(){let mine=chores.filter(c=>c.assigned_to===session.user.id);return \'<div class="card family-calendar-card"><h2>Chore calendar</h2><div id="familyChoreCalendar"></div></div><div class="card"><h2>My chores</h2>\'';
if (html.includes(oldChild)) {
  html = html.replace(oldChild,newChild);
} else if (!html.includes('family-calendar-card')) {
  throw new Error("Could not find the child dashboard insertion point");
}

const renderMarker = "app.innerHTML=top+(parent?parentUI():childUI());";
if (html.includes(renderMarker) && !html.includes("renderFamilyChoreCalendar();")) {
  html = html.replace(renderMarker,renderMarker+"renderFamilyChoreCalendar();");
}

fs.writeFileSync(file,html);
console.log("Added child chore calendar.");
