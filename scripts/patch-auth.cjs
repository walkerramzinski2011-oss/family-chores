const fs = require("fs");

const file = "index.html";
const site = "https://walkerramzinski2011-oss.github.io/family-chores/";
let html = fs.readFileSync(file, "utf8");

const oldAuth = 'db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.localStorage}})';
const newAuth = 'db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}})';
if (!html.includes(oldAuth)) throw new Error("Expected Supabase client initialization was not found.");
html = html.replace(oldAuth, newAuth);

const oldSignUp = 'db.auth.signUp({email:email.value,password:password.value})';
const newSignUp = 'db.auth.signUp({email:email.value,password:password.value,options:{emailRedirectTo:site}})';
if (!html.includes(oldSignUp)) throw new Error("Expected sign-up call was not found.");
html = html.replace(oldSignUp, newSignUp);

const rewardFunction = /function rewardRows\(request\)\{[\s\S]*?\}\nfunction requestRows/;
const newRewardFunction = `function rewardRows(request){if(!rewards.length)return '<p class="muted">No rewards yet.</p>';return rewards.map(r=>{let cost=Number(r.cost||0);let canAfford=Number(me?.points||0)>=cost;let action=request?'<button onclick="parentDeleteReward(\\\''+r.id+'\\\')">Delete</button>':(canAfford?'<button class="primary" onclick="parentDeleteReward(\\\''+r.id+'\\\')">Choose</button>':'<button disabled title="Not enough credits" style="opacity:.55;cursor:not-allowed">Need '+cost+' credits</button>');return '<div class="row"><div><b>'+esc(r.title)+'</b><div class="muted">'+cost+' points</div></div><div>'+action+'</div></div>'}).join("")}
function requestRows`;
if (!rewardFunction.test(html)) throw new Error("Expected reward list renderer was not found.");
html = html.replace(rewardFunction, newRewardFunction);

const rewardRequestFunction = /window\.rewardReq=async id=>\{[\s\S]*?\};/;
const newRewardRequestFunction = `window.rewardReq=async id=>{let reward=rewards.find(r=>r.id===id);if(!reward)return;if(me?.role==="child"&&Number(me.points||0)<Number(reward.cost||0)){alert("You do not have enough credits for this reward.");return}let r=await db.rpc("request_reward",{p_reward_id:id});if(r.error)alert(r.error.message);else{await load();dashboard()}};`;
if (!rewardRequestFunction.test(html)) throw new Error("Expected reward request function was not found.");
html = html.replace(rewardRequestFunction, newRewardRequestFunction);

const parentFunction = /function parentUI\(\)\{[\s\S]*?\}\nfunction choreRows/;
const newParentFunction = `function parentUI(){let kids=members.filter(x=>x.role==="child");let kidsCredits=kids.length?'<div class="card"><h2>Children & credits</h2>'+kids.map(k=>'<div class="row"><div><b>'+esc(k.display_name||"Child")+'</b><div class="muted">Credits available</div></div><div><b>'+Number(k.points||0)+'</b></div></div>').join("")+'</div>':'<div class="card"><h2>Children & credits</h2><p class="muted">No children have joined yet.</p></div>';return '<div class="grid">'+kidsCredits+'<div class="card"><h2>Add chore</h2><form id="addChore"><input id="title" placeholder="Chore" required><select id="assigned" required><option value="">Choose child</option>'+kids.map(k=>'<option value="'+k.user_id+'">'+esc(k.display_name)+'</option>').join("")+'</select><input id="points" type="number" min="1" value="10"><label>Due date<input id="dueDate" type="date"></label><label>Repeat</label><div class="recurrence-tabs"><input id="repeatOnce" type="radio" name="recurrence" value="once" checked><label for="repeatOnce">Once</label><input id="repeatDaily" type="radio" name="recurrence" value="daily"><label for="repeatDaily">Daily</label><input id="repeatWeekly" type="radio" name="recurrence" value="weekly"><label for="repeatWeekly">Weekly</label><input id="repeatMonthly" type="radio" name="recurrence" value="monthly"><label for="repeatMonthly">Monthly</label></div><button class="primary">Add chore</button></form></div><div class="card"><h2>Add reward</h2><form id="addReward"><input id="rewardTitle" placeholder="Reward" required><input id="cost" type="number" min="1" value="50"><button class="primary">Add reward</button></form></div></div><div class="card"><h2>Chores</h2>'+choreRows()+'</div><div class="card"><h2>Rewards</h2>'+rewardRows(true)+'</div><div class="card"><h2>Reward requests</h2>'+requestRows()+'</div>'}
function choreRows`;
if (!parentFunction.test(html)) throw new Error("Expected parent dashboard renderer was not found.");
html = html.replace(parentFunction, newParentFunction);

fs.writeFileSync(file, html);
console.log("Patched GitHub Pages auth, child reward eligibility, and parent credit display:", site);
